import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { askArchivist, finalizeArchive, initialInterview } from '../lib/friendshipArchivist';
import { useLocale } from '../locales.jsx';

/** A listening room, not a chatbot: every answer becomes material for a private archive. */
function inferredStartDate(answer) {
  const text = String(answer || '');
  const year = text.match(/\b(?:19|20)\d{2}\b/)?.[0];
  if (!/(met|meet|friendship|freshman|school|认识|相遇|遇到|高中|大学)/i.test(text)) return null;
  return year ? `${year}-01-01` : null;
}

export function FriendshipInterview({ open, onClose, onArchived, onConfirmFriendshipStart, seed = [] }) {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState(() => seed.length ? seed : initialInterview(locale));
  const [draft, setDraft] = useState(null);
  const [value, setValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [startDateSuggestion, setStartDateSuggestion] = useState(null);
  const scrollRef = useRef(null);
  const openedRef = useRef(false);
  const seedRef = useRef(seed);
  const userAnswers = messages.filter((message) => message.role === 'user').length;

  // Only initialise when a new interview begins. Locale changes deliberately
  // leave messages, draft and the typed response untouched.
  useEffect(() => {
    const startedNewSeed = open && openedRef.current && seedRef.current !== seed;
    if (open && (!openedRef.current || startedNewSeed)) {
      setMessages(seed.length ? seed : initialInterview(locale));
      setDraft(null);
      setValue('');
      setCompletionOpen(false);
      setStartDateSuggestion(null);
      openedRef.current = true;
    }
    seedRef.current = seed;
    if (!open) openedRef.current = false;
  }, [open, seed, locale]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const respond = async (answer) => {
    const content = answer.trim();
    if (!content || thinking) return;
    const next = [...messages, { id: crypto.randomUUID(), role: 'user', content }];
    setMessages(next);
    setValue('');
    setThinking(true);
    const response = await askArchivist(next, draft, locale);
    setDraft((current) => ({ ...current, ...(response.extraction || {}) }));
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: response.reply }]);
    const suggested = response.extraction?.friendship_start_date || inferredStartDate(content);
    if (suggested) setStartDateSuggestion(String(suggested).slice(0, 10));
    setThinking(false);
  };

  const archive = async () => {
    if (!userAnswers) return;
    setThinking(true);
    const result = await finalizeArchive(messages, draft, locale);
    await onArchived(result);
    setThinking(false);
    setCompletionOpen(false);
  };

  return <AnimatePresence>{open && <motion.aside className="interview-overlay" role="dialog" aria-modal="true" aria-label={t('friendshipInterview')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="interview-backdrop" aria-label={t('close')} onClick={onClose} />
    <motion.section className="interview-room" initial={{ y: 34, opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 22, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 23 }}>
      <header className="interview-header">
        <div><p>{t('interviewCollection')}</p><h2>{t('friendshipInterview')}</h2></div>
        <button onClick={onClose}>{t('saveClose')} <span>×</span></button>
      </header>
      <div className="interview-scene" aria-hidden="true"><i /><i /><i /><span>✦</span></div>
      <div className="interview-intro">
        <p className="room-kicker">{t('archivistConversation')}</p>
        <h1>{t('interviewTitle')}</h1>
        <p>{t('interviewBody')}</p>
        <small>{t('interviewReassurance')}</small>
      </div>
      <div className="interview-ledger" ref={scrollRef} aria-live="polite">
        {messages.map((message) => <article className={`interview-note ${message.role}`} key={message.id}>
          <p>{message.role === 'assistant' ? t('archivist') : t('you')}</p>
          <div>{message.content}</div>
        </article>)}
        {thinking && <article className="interview-note assistant thinking"><p>{t('archivist')}</p><div><i /> <i /> <i /></div></article>}
      </div>
      <footer className="interview-compose">
        <div className="interview-tools"><span>{t('memoriesGathered', { count: userAnswers, unit: t(userAnswers === 1 ? 'memory' : 'memories') })}</span>{userAnswers > 0 && <button type="button" onClick={() => setCompletionOpen(true)}>{t('readyToRemember')}</button>}</div>
        {startDateSuggestion && <div className="start-date-suggestion"><p>{t('friendshipDateSuggestion', { year: startDateSuggestion.slice(0, 4) })}</p><div><button type="button" onClick={() => { onConfirmFriendshipStart?.(startDateSuggestion); setStartDateSuggestion(null); }}>{t('useYear', { year: startDateSuggestion.slice(0, 4) })}</button><button type="button" onClick={() => setStartDateSuggestion(null)}>{t('chooseAnotherDate')}</button></div></div>}
        <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); respond(value); } }} placeholder={t('writeAnything')} rows="3" />
        <div className="interview-actions"><button type="button" className="leave-unwritten" onClick={() => respond(t('skip'))}>{t('leaveUnwritten')}</button><button type="button" className="send-memory" disabled={!value.trim() || thinking} onClick={() => respond(value)}>{t('continue')} <span>↗</span></button></div>
      </footer>
      <AnimatePresence>{completionOpen && <motion.div className="interview-completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section initial={{ y: 18, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }}>
          <button className="completion-close" onClick={() => setCompletionOpen(false)} aria-label={t('continueInterview')}>×</button>
          <p>{t('takingShapeBridge')}</p><h2>{t('takingShapeTitle')}</h2><span>{t('takingShapeBody')}</span>
          <div className="completion-path"><b>{t('friendshipInterview')}</b><i>↓</i><b>{t('privateGirlie')}</b></div>
          <strong>{t('createPrivateBody')}</strong>
          <button className="completion-cta" disabled={thinking} onClick={archive}>{thinking ? t('creatingPrivate') : t('createPrivateGirlie')}</button>
          <button className="completion-continue" onClick={() => setCompletionOpen(false)}>{t('continueInterview')}</button>
        </motion.section>
      </motion.div>}</AnimatePresence>
    </motion.section>
  </motion.aside>}</AnimatePresence>;
}
