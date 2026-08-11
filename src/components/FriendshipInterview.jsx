import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { askArchivist, createLocalArchive, initialInterview } from '../lib/friendshipArchivist';
import { useLocale } from '../locales.jsx';

/** A listening room, not a chatbot: each answer becomes material for a private archive. */
export function FriendshipInterview({ open, onClose, onArchived, seed = [] }) {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState(() => seed.length ? seed : initialInterview(locale));
  const [draft, setDraft] = useState(null);
  const [value, setValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const userAnswers = messages.filter((message) => message.role === 'user').length;

  useEffect(() => {
    if (open) {
      setMessages(seed.length ? seed : initialInterview(locale));
      setDraft(null);
      setValue('');
    }
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
    setThinking(false);
  };

  const archive = () => {
    const result = createLocalArchive(messages, draft);
    onArchived(result);
    onClose();
  };

  return <AnimatePresence>{open && <motion.aside className="interview-overlay" role="dialog" aria-modal="true" aria-label="Friendship interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="interview-backdrop" aria-label="Close interview" onClick={onClose} />
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
      </div>
      <div className="interview-ledger" ref={scrollRef} aria-live="polite">
        {messages.map((message) => <article className={`interview-note ${message.role}`} key={message.id}>
          <p>{message.role === 'assistant' ? t('archivist') : t('you')}</p>
          <div>{message.content}</div>
        </article>)}
        {thinking && <article className="interview-note assistant thinking"><p>{t('archivist')}</p><div><i /> <i /> <i /></div></article>}
      </div>
      <footer className="interview-compose">
        <div className="interview-tools"><span>{t('memoriesGathered', { count: userAnswers, unit: t(userAnswers === 1 ? 'memory' : 'memories') })}</span>{userAnswers > 0 && <button type="button" onClick={archive}>{t('becomingArchive')}</button>}</div>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); respond(value); } }} placeholder={t('writeAnything')} rows="3" />
        <div className="interview-actions"><button type="button" className="leave-unwritten" onClick={() => respond(t('skip'))}>{t('leaveUnwritten')}</button><button type="button" className="send-memory" disabled={!value.trim() || thinking} onClick={() => respond(value)}>{t('continue')} <span>↗</span></button></div>
      </footer>
    </motion.section>
  </motion.aside>}</AnimatePresence>;
}
