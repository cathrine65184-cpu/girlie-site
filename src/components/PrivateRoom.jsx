import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const empty = (value) => value?.length ? value : [];

function AuthPanel({ onClose, store }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const response = mode === 'signup' ? await store.signIn(email, password, name) : await store.signInExisting(email, password);
    setNotice(response.error ? response.error.message : mode === 'signup' ? 'Check your email to confirm your private room.' : 'Welcome back to your room.');
  };
  return <section className="private-auth"><button className="private-x" onClick={onClose}>Close ×</button><p>Private room</p><h2>Keep the archive with you.</h2><span>Sign in to save this room across devices. Until then, it remains a private draft in this browser.</span><form onSubmit={submit}>{mode === 'signup' && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" /><input required minLength="6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (6+ characters)" /><button>{mode === 'signup' ? 'Create my private room' : 'Enter my private room'}</button></form><button className="auth-switch" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'I already have an account' : 'Create an account instead'}</button>{notice && <small>{notice}</small>}</section>;
}

function ArchiveEditor({ archive, onChange, onAddMemory, onBack }) {
  const [editing, setEditing] = useState(false);
  const update = (patch) => onChange({ ...archive, ...patch });
  const updateStory = (content) => update({ story: { ...archive.story, content } });
  const timeline = empty(archive.timeline);
  const places = empty(archive.places);
  const objects = empty(archive.objects);
  return <article className="private-archive">
    <header className="private-archive-head"><button onClick={onBack}>← My room</button><p>Private Friendship Archive · {archive.privacy === 'private' ? 'locked' : 'shared by permission'}</p><div><button onClick={() => setEditing((value) => !value)}>{editing ? 'Done editing' : 'Edit archive'}</button><button className="add-memory" onClick={() => onAddMemory(archive)}>＋ Add a memory</button></div></header>
    <section className="archive-title"><p>My Friendship Archive</p>{editing ? <input value={archive.title} onChange={(event) => update({ title: event.target.value })} aria-label="Archive title" /> : <h1>{archive.title}</h1>}<span>{archive.friendName ? `For ${archive.friendName}` : 'A friendship still taking shape'} · private by default</span></section>
    <section className="archive-story-paper"><p>01 · Our story <i>{archive.story.source}</i></p>{editing ? <textarea value={archive.story.content} onChange={(event) => updateStory(event.target.value)} rows="10" /> : <div>{archive.story.content.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}<small>Story v{archive.story.version} · {archive.versions.length} version{archive.versions.length === 1 ? '' : 's'} preserved</small></section>
    <div className="archive-shelves">
      <section><p>02 · Friendship timeline</p>{timeline.length ? <ol className="memory-line">{timeline.map((item) => <li key={item.id}><b>{item.date || 'Undated'}</b><div><strong>{item.title}</strong><span>{item.note}</span></div></li>)}</ol> : <em>The first date can arrive whenever you remember it.</em>}</section>
      <section><p>03 · Important places</p>{places.length ? <div className="place-list">{places.map((place) => <button key={place.name}>⌖ <b>{place.name}</b><span>{place.note}</span></button>)}</div> : <em>A school gate, a bakery, a city far away — add them through a memory.</em>}</section>
      <section><p>04 · Friendship objects</p>{objects.length ? <div className="object-cabinet">{objects.map((object, index) => <article key={`${object.name}-${index}`}><span>Object {String(index + 1).padStart(2, '0')}</span><b>{object.name}</b><i>{object.note}</i></article>)}</div> : <em>When an object appears in your story, the archivist will place it here.</em>}</section>
    </div>
    <section className="archive-afterword"><div><p>Keywords</p><span>{empty(archive.keywords).length ? archive.keywords.join(' · ') : 'waiting for the words that belong to you'}</span></div><div><p>Her sentence</p><blockquote>{archive.quote ? `“${archive.quote}”` : 'The strongest sentence is still on its way.'}</blockquote></div><div className="capsule"><p>Time capsule</p><b>Open in {archive.capsule.openIn}</b><span>Keep a letter, a voice note, or one small hope for later.</span></div></section>
  </article>;
}

/** A spatial, quiet home for personal archives — never a dashboard. */
export function PrivateRoom({ open, onClose, store, onStartInterview }) {
  const [view, setView] = useState('room');
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(() => store.archives.find((archive) => archive.id === activeId) || store.archives[0], [activeId, store.archives]);
  useEffect(() => { if (open) { setView('room'); setActiveId(null); } }, [open]);
  const update = async (next) => {
    const storyChanged = active?.story.content !== next.story.content;
    const versioned = storyChanged ? { ...next, story: { ...next.story, version: next.story.version + 1 }, versions: [...next.versions, { version: next.story.version + 1, createdAt: new Date().toISOString(), content: next.story.content }] } : next;
    await store.save(versioned);
  };
  const addMemory = (archive) => { onClose(); onStartInterview([...archive.interview, { id: crypto.randomUUID(), role: 'assistant', content: "Something reminded you of her today. What happened?" }]); };
  return <AnimatePresence>{open && <motion.aside className="private-room-overlay" role="dialog" aria-modal="true" aria-label="My private room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="private-backdrop" aria-label="Close private room" onClick={onClose} />
    <motion.section className="private-room" initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }}>
      {!store.session && view === 'auth' ? <AuthPanel onClose={() => setView('room')} store={store} /> : view === 'archive' && active ? <ArchiveEditor archive={active} onChange={update} onBack={() => setView('room')} onAddMemory={addMemory} /> : <>
        <header className="private-room-head"><div><p>My private room</p><h2>A small museum for the friendships that are yours.</h2></div><div>{store.session ? <button onClick={store.signOut}>Sign out</button> : <button onClick={() => setView('auth')}>Sign in to keep forever</button>}<button onClick={onClose}>Close ×</button></div></header>
        <div className="private-room-scene" aria-hidden="true"><div className="room-window" /><div className="room-desk"><i /><i /><i /></div><div className="room-drawer">✉</div></div>
        <section className="private-room-intro"><p>{store.session ? 'Your room is encrypted by access rules and visible only to your account.' : 'Private draft · saved only on this device until you sign in.'}</p><button onClick={() => onStartInterview([])}>Create a friendship archive <span>↗</span></button></section>
        <section className="private-bookcase"><div className="bookcase-head"><p>My friendships</p><span>{store.archives.length} archive{store.archives.length === 1 ? '' : 's'} · {store.syncState === 'synced' ? 'saved privately' : 'private draft'}</span></div>{store.archives.length ? <div className="archive-books">{store.archives.map((archive, index) => <button key={archive.id} className={`archive-book book-${index % 4}`} onClick={() => { setActiveId(archive.id); setView('archive'); }}><i>{String(index + 1).padStart(2, '0')}</i><b>{archive.title}</b><span>{archive.friendName || 'A friendship in progress'}</span><em>{archive.updatedAt.slice(0, 10)}</em></button>)}</div> : <div className="empty-room"><span>✦</span><h3>The first shelf is waiting.</h3><p>Begin with one person, one memory, or one ordinary thing that still reminds you of her.</p><button onClick={() => onStartInterview([])}>Start my friendship interview</button></div>}</section>
      </>}
    </motion.section>
  </motion.aside>}</AnimatePresence>;
}
