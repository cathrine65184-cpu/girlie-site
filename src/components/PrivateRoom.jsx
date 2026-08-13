import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../locales.jsx';

const empty = (value) => value?.length ? value : [];

function AuthPanel({ onClose, store }) {
  const { t } = useLocale();
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const response = mode === 'signup' ? await store.signIn(email, password, name) : await store.signInExisting(email, password);
    setNotice(response.error ? response.error.message : mode === 'signup' ? t('checkEmail') : t('welcomeBack'));
  };
  return <section className="private-auth"><button className="private-x" onClick={onClose}>{t('close')}</button><p>{t('authPrivate')}</p><h2>{t('authTitle')}</h2><span>{t('authBody')}</span><form onSubmit={submit}>{mode === 'signup' && <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('yourName')} />}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('email')} /><input required minLength="6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('password')} /><button>{mode === 'signup' ? t('createPrivate') : t('enterPrivate')}</button></form><button className="auth-switch" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? t('accountExists') : t('createInstead')}</button>{notice && <small>{notice}</small>}</section>;
}

function ArchiveEditor({ archive, onChange, onAddMemory, onBack }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const update = (patch) => onChange({ ...archive, ...patch });
  const updateStory = (content) => update({ story: { ...archive.story, content } });
  const timeline = empty(archive.timeline);
  const places = empty(archive.places);
  const objects = empty(archive.objects);
  const keywords = empty(archive.keywords);
  return <article className="private-archive">
    <header className="private-archive-head"><button onClick={onBack}>{t('archiveBack')}</button><p>{t('privateArchive')} · {archive.privacy === 'private' ? t('locked') : t('sharedPermission')}</p><div><button onClick={() => setEditing((value) => !value)}>{editing ? t('doneEditing') : t('editArchive')}</button><button className="add-memory" onClick={() => onAddMemory(archive)}>{t('addMemory')}</button></div></header>
    <section className="archive-title"><p>{t('myArchive')}</p>{editing ? <input value={archive.title} onChange={(event) => update({ title: event.target.value })} aria-label={t('myArchive')} /> : <h1>{archive.title}</h1>}<span>{archive.friendName ? t('forFriend', { name: archive.friendName }) : t('takingShape')} · {t('privateDefault')}</span></section>
    <section className="archive-story-paper"><p>01 · {t('ourStory')} <i>{archive.story.source === 'your words' ? t('originalWords') : t('aiAssisted')}</i></p>{editing ? <textarea value={archive.story.content} onChange={(event) => updateStory(event.target.value)} rows="10" /> : <div>{archive.story.content.split('\n\n').map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}</div>}<small>{t('versionsPreserved', { version: archive.story.version, count: archive.versions.length, label: t(archive.versions.length === 1 ? 'version' : 'versions') })}</small></section>
    <div className="archive-shelves">
      <section><p>02 · {t('timeline')}</p>{timeline.length ? <ol className="memory-line">{timeline.map((item) => <li key={item.id}><b>{item.date || t('undated')}</b><div><strong>{item.title}</strong><span>{item.note}</span></div></li>)}</ol> : <em>{t('firstDate')}</em>}</section>
      <section><p>03 · {t('importantPlaces')}</p>{places.length ? <div className="place-list">{places.map((place) => <button key={place.name}>⌖ <b>{place.name}</b><span>{place.note}</span></button>)}</div> : <em>{t('placesEmpty')}</em>}</section>
      <section><p>04 · {t('friendshipObjects')}</p>{objects.length ? <div className="object-cabinet">{objects.map((object, index) => <article key={`${object.name}-${index}`}><span>{t('object')} {String(index + 1).padStart(2, '0')}</span><b>{object.name}</b><i>{object.note}</i></article>)}</div> : <em>{t('objectsEmpty')}</em>}</section>
    </div>
    <section className="archive-afterword"><div><p>{t('friendshipBloom')}</p><span>{keywords.length ? keywords.join(' · ') : t('bloomEmpty')}</span></div><div><p>{t('herSentence')}</p><blockquote>{archive.quote ? `“${archive.quote}”` : t('sentenceWaiting')}</blockquote></div><div className="capsule"><p>{t('timeCapsule')}</p><b>{t('openIn', { value: archive.capsule.openIn })}</b><span>{t('capsuleBody')}</span></div></section>
  </article>;
}

/** A spatial, quiet home for personal archives — never a dashboard. */
export function PrivateRoom({ open, onClose, store, onStartInterview, requireAuth = false }) {
  const { t } = useLocale();
  const [view, setView] = useState('room');
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(() => store.archives.find((archive) => archive.id === activeId) || store.archives[0], [activeId, store.archives]);
  useEffect(() => { if (open) { setView(requireAuth && !store.session ? 'auth' : 'room'); setActiveId(null); } }, [open, requireAuth, store.session]);
  const update = async (next) => {
    const storyChanged = active?.story.content !== next.story.content;
    const versioned = storyChanged ? { ...next, story: { ...next.story, version: next.story.version + 1 }, versions: [...next.versions, { version: next.story.version + 1, createdAt: new Date().toISOString(), content: next.story.content }] } : next;
    await store.save(versioned);
  };
  const addMemory = (archive) => { onClose(); onStartInterview([...archive.interview, { id: crypto.randomUUID(), role: 'assistant', content: t('firstQuestion') }]); };
  const start = () => onStartInterview([]);
  return <AnimatePresence>{open && <motion.aside className="private-room-overlay" role="dialog" aria-modal="true" aria-label={t('privateGirlie')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="private-backdrop" aria-label={t('close')} onClick={onClose} />
    <motion.section className="private-room" initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }}>
      {!store.session && view === 'auth' ? <AuthPanel onClose={() => setView('room')} store={store} /> : view === 'archive' && active ? <ArchiveEditor archive={active} onChange={update} onBack={() => setView('room')} onAddMemory={addMemory} /> : <>
        <header className="private-room-head"><div><p>{t('privateGirlie')}</p><h2>{store.archives.length ? t('shelfTitle') : t('privateWelcomeTitle')}</h2></div><div>{store.session ? <button onClick={store.signOut}>{t('signOut')}</button> : <button onClick={() => setView('auth')}>{t('signInForever')}</button>}<button onClick={onClose}>{t('close')}</button></div></header>
        <div className="private-room-scene" aria-hidden="true"><div className="room-window" /><div className="room-desk"><i /><i /><i /></div><div className="room-drawer">✉</div></div>
        <section className="private-room-intro"><p>{store.archives.length ? (store.session ? t('roomProtected') : t('accountBefore')) : t('privateWelcomeBody')}</p><button onClick={start}>{t('startInterview')} <span>↗</span></button></section>
        <section className="private-bookcase"><div className="bookcase-head"><p>{t('myFriendships')}</p><span>{store.archives.length} {t(store.archives.length === 1 ? 'archive' : 'archives')} · {store.syncState === 'synced' ? t('savedPrivately') : t('accountRequired')}</span></div>{store.archives.length ? <div className="archive-books">{store.archives.map((archive, index) => <button key={archive.id} className={`archive-book book-${index % 4}`} onClick={() => { setActiveId(archive.id); setView('archive'); }}><i>{String(index + 1).padStart(2, '0')}</i><b>{archive.title}</b><span>{archive.friendName || t('friendshipProgress')}</span><em>{archive.updatedAt.slice(0, 10)}</em></button>)}</div> : <div className="empty-room"><span>✦</span><h3>{t('firstShelf')}</h3><p>{t('shelfBody')}</p><button onClick={start}>{t('startInterview')}</button></div>}</section>
      </>}
    </motion.section>
  </motion.aside>}</AnimatePresence>;
}
