import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { askArchivist, createLocalArchive, initialInterview } from '../lib/friendshipArchivist';

const skipMessage = "I'd rather leave that part unwritten.";

/** A listening room, not a chatbot: each answer becomes material for a private archive. */
export function FriendshipInterview({ open, onClose, onArchived, seed = [] }) {
  const [messages, setMessages] = useState(() => seed.length ? seed : initialInterview);
  const [draft, setDraft] = useState(null);
  const [value, setValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const userAnswers = messages.filter((message) => message.role === 'user').length;

  useEffect(() => {
    if (open) {
      setMessages(seed.length ? seed : initialInterview);
      setDraft(null);
      setValue('');
    }
  }, [open, seed]);

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
    const response = await askArchivist(next, draft);
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
        <div><p>Private collection · 01</p><h2>Friendship Interview</h2></div>
        <button onClick={onClose}>Save & close <span>×</span></button>
      </header>
      <div className="interview-scene" aria-hidden="true"><i /><i /><i /><span>✦</span></div>
      <div className="interview-intro">
        <p className="room-kicker">A conversation with the friendship archivist</p>
        <h1>Tell us about someone who changed your life.</h1>
        <p>There is no form to complete. Share only what feels right; the unwritten parts can stay yours.</p>
      </div>
      <div className="interview-ledger" ref={scrollRef} aria-live="polite">
        {messages.map((message) => <article className={`interview-note ${message.role}`} key={message.id}>
          <p>{message.role === 'assistant' ? 'The archivist' : 'You'}</p>
          <div>{message.content}</div>
        </article>)}
        {thinking && <article className="interview-note assistant thinking"><p>The archivist</p><div><i /> <i /> <i /></div></article>}
      </div>
      <footer className="interview-compose">
        <div className="interview-tools"><span>{userAnswers} {userAnswers === 1 ? 'memory' : 'memories'} gathered</span>{userAnswers > 0 && <button type="button" onClick={archive}>She's becoming part of your archive →</button>}</div>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); respond(value); } }} placeholder="Write as much or as little as you want…" rows="3" />
        <div className="interview-actions"><button type="button" className="leave-unwritten" onClick={() => respond(skipMessage)}>Leave this part unwritten</button><button type="button" className="send-memory" disabled={!value.trim() || thinking} onClick={() => respond(value)}>Continue <span>↗</span></button></div>
      </footer>
    </motion.section>
  </motion.aside>}</AnimatePresence>;
}
