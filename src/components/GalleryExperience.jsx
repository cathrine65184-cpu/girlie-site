import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../locales.jsx';

const languageCodes = {
  'Mandarin Chinese': 'zh-CN', Ukrainian: 'uk-UA', French: 'fr-FR', Malay: 'ms-MY', Japanese: 'ja-JP',
  'American English': 'en-US', 'Brazilian Portuguese': 'pt-BR', Hindi: 'hi-IN', 'British English': 'en-GB',
  'Australian English': 'en-AU', Korean: 'ko-KR',
};

const songs = {
  Emma: ['小幸运', 'Hebe Tian 田馥甄'], Anna: ['Обійми', 'Okean Elzy'], 'Élise': ['La Vie en rose', 'Édith Piaf'],
  Mei: ['Count on Me', 'Bruno Mars'], Yuki: ['打上花火', 'DAOKO × Kenshi Yonezu'], Grace: ['You’ve Got a Friend', 'Carole King'],
  Sofia: ['Trem-Bala', 'Ana Vilela'], Diya: ['Yeh Dosti', 'Sholay (1975)'], Lily: ['Fix You', 'Coldplay'],
  Mia: ['Riptide', 'Vance Joy'], Soo: ['Dear My Friend', 'Agust D ft. Kim Jong Wan'],
};

const constellationTitles = [
  'Twin Flames of the Autumn Moon', 'Two Rivers, One Sea', 'The Parallel Comets', 'Sisters of the Same Star',
  'The Mirror Constellation', 'Keepers of the Peach Garden', 'The Red Thread Astronomers', 'Moonlight Co-Conspirators',
];
const elements = ['Moonlight', 'Rose Gold', 'Sea Glass', 'First Snow', 'Peach Blossom', 'Northern Star', 'Morning Fog', 'Candlelight'];

function hashText(value) {
  return [...value].reduce((hash, character) => ((hash * 131) + character.charCodeAt(0)) >>> 0, 9);
}

function makeRandom(seed) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeConstellation(first, second) {
  const hash = hashText([first.trim().toLowerCase(), second.trim().toLowerCase()].sort().join('✦'));
  const random = makeRandom(hash);
  const points = Array.from({ length: 7 + (hash % 3) }, (_, index) => ({
    x: 10 + random() * 80,
    y: 14 + random() * 66,
    large: index % 3 === 0,
  }));
  return {
    id: hash,
    title: constellationTitles[hash % constellationTitles.length],
    element: elements[(hash >>> 5) % elements.length],
    score: 82 + (hash % 18),
    points,
  };
}

function speak(text, language, setSpeaking) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = .78;
  utterance.pitch = 1.08;
  utterance.onstart = () => setSpeaking(true);
  utterance.onend = utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

function GalleryFrame({ hall, title, eyebrow, onClose, children }) {
  const { locale } = useLocale();
  const chinese = locale === 'zh';
  return <motion.div className={`immersive-gallery gallery-${hall}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={title}>
    <div className="gallery-ambient" />
    <header className="gallery-header">
      <p><span>{chinese ? 'Girlie 友谊博物馆' : 'Girlie Friendship Museum'}</span>{eyebrow}</p>
      <button className="gallery-close" onClick={onClose}>{chinese ? '离开展厅' : 'Leave gallery'} <span>×</span></button>
    </header>
    {children}
  </motion.div>;
}

function LanguageGallery({ girls, onClose }) {
  const { locale } = useLocale();
  const chinese = locale === 'zh';
  const [selected, setSelected] = useState(girls[0]);
  const [speaking, setSpeaking] = useState(false);
  const wordPositions = useMemo(() => [
    [13, 35], [28, 18], [44, 42], [60, 20], [79, 38], [88, 68], [67, 74], [45, 69], [24, 76], [8, 62], [84, 14],
  ], []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return <GalleryFrame hall="language" title={chinese ? '语言展厅' : 'Language Gallery'} eyebrow={chinese ? '第二展厅 · 被说出的词语' : 'Gallery two · spoken objects'} onClose={onClose}>
    <div className="language-space">
      <div className="language-window"><span /><span /><span /></div>
      <div className="language-floor" />
      <div className="word-orbit" aria-label={chinese ? '馆藏中的词语' : 'Words from the collection'}>
        {girls.map((girl, index) => <button
          key={girl.id}
          className={`floating-word ${selected.id === girl.id ? 'is-selected' : ''}`}
          style={{ '--word-x': `${wordPositions[index][0]}%`, '--word-y': `${wordPositions[index][1]}%`, '--word-delay': `${index * -.7}s` }}
          onMouseEnter={() => setSelected(girl)}
          onFocus={() => setSelected(girl)}
          onClick={() => { setSelected(girl); speak(girl.word, languageCodes[girl.lang] || 'en-US', setSpeaking); }}
        >
          <b>{girl.word}</b><small>{girl.lang}</small>
        </button>)}
      </div>
      <motion.aside className="language-plaque" key={selected.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <p className="exhibit-number">{chinese ? '词语藏品' : 'WORD OBJECT'} · {String(girls.findIndex((girl) => girl.id === selected.id) + 1).padStart(2, '0')}</p>
        <p className="plaque-city">{selected.f} {selected.city} · {selected.lang}</p>
        <h1>{selected.word}</h1>
        <p className="pronunciation">/{selected.sound}/</p>
        <div className="plaque-rule" />
        <p className="plaque-story">“{selected.q}”</p>
        <p className="plaque-note">{chinese ? `这是 ${selected.n} 珍藏在友谊馆藏中的一个词。` : `A word held close by ${selected.n}, in the friendship collection.`}</p>
        <button className={`pronounce-button ${speaking ? 'is-speaking' : ''}`} onClick={() => speak(selected.word, languageCodes[selected.lang] || 'en-US', setSpeaking)}>
          <i>◌</i>{speaking ? (chinese ? '正在展厅中朗读…' : 'Speaking in the gallery…') : (chinese ? '聆听发音' : 'Hear the pronunciation')}
        </button>
      </motion.aside>
      <p className="gallery-prompt language-prompt">{chinese ? '走近词语 · 停下来聆听' : 'Move through the words · pause to listen'}</p>
    </div>
  </GalleryFrame>;
}

function ObservatorySky({ chart }) {
  const stars = useMemo(() => {
    const random = makeRandom(24601);
    return Array.from({ length: 84 }, (_, index) => ({ x: random() * 100, y: random() * 70, size: 1 + random() * 2.5, delay: `${-random() * 5}s`, id: index }));
  }, []);
  const polyline = chart.points.map((point) => `${point.x},${point.y}`).join(' ');

  return <div className="observatory-sky" aria-hidden="true">
    <div className="sky-moon" />
    {stars.map((star) => <i key={star.id} className="sky-star" style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, animationDelay: star.delay }} />)}
    <svg className="constellation-drawing" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={polyline} />
      {chart.points.map((point, index) => <g key={`${chart.id}-${index}`}><circle className="star-halo" cx={point.x} cy={point.y} r={point.large ? 3.3 : 2.1} /><circle className="star-core" cx={point.x} cy={point.y} r={point.large ? 1.05 : .65} /></g>)}
    </svg>
  </div>;
}

function StarObservatory({ onClose }) {
  const { locale } = useLocale();
  const chinese = locale === 'zh';
  const [firstName, setFirstName] = useState('Catherine');
  const [secondName, setSecondName] = useState('Oleksandra');
  const [chart, setChart] = useState(() => makeConstellation('Catherine', 'Oleksandra'));
  const [hasRead, setHasRead] = useState(false);
  const generate = (event) => {
    event.preventDefault();
    if (!firstName.trim() || !secondName.trim()) return;
    setChart(makeConstellation(firstName, secondName));
    setHasRead(true);
  };

  return <GalleryFrame hall="observatory" title={chinese ? '星空观测室' : 'Star Observatory'} eyebrow={chinese ? '第三展厅 · 星空档案' : 'Gallery three · celestial archive'} onClose={onClose}>
    <div className="observatory-space">
      <div className="observatory-dome"><ObservatorySky chart={chart} /></div>
      <div className="observatory-ring ring-one" /><div className="observatory-ring ring-two" />
      <div className="observatory-plinth">
        <p className="exhibit-number">{chinese ? '友谊星图' : 'THE FRIENDSHIP STAR CHART'}</p>
        <h1>{chinese ? '每一对朋友都会在天空留下图案。' : 'Every pair leaves a pattern in the sky.'}</h1>
        <p className="observatory-intro">{chinese ? '向观测室轻声说出两个名字，夜空会为你们描出独有的星座。' : 'Whisper two names into the observatory. The night will trace a small constellation only for you.'}</p>
        <form className="star-form" onSubmit={generate}>
          <label><span>{chinese ? '你的名字' : 'Your name'}</span><input maxLength="22" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
          <i>✦</i>
          <label><span>{chinese ? '她的名字' : 'Her name'}</span><input maxLength="22" value={secondName} onChange={(event) => setSecondName(event.target.value)} /></label>
          <button type="submit">{chinese ? '描绘我们的星图' : 'Trace our stars'} <span>↗</span></button>
        </form>
      </div>
      <motion.article className="star-reading" key={chart.id} initial={{ opacity: 0, scale: .96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .7 }}>
        <p>{chinese ? '星座编号' : 'CONSTELLATION NO.'} {100 + (chart.id % 900)}</p>
        <h2>{chart.title}</h2>
        <div><b>{firstName || (chinese ? '你' : 'You')} <span>✦</span> {secondName || (chinese ? '她' : 'Her')}</b><em>{chart.score}% {chinese ? '写在星空里' : 'written in the stars'}</em></div>
        <small>{chinese ? '共同元素：' : 'Shared element: '}{chart.element}</small>
      </motion.article>
      <p className="gallery-prompt observatory-prompt">{hasRead ? (chinese ? '一幅新星图加入了今晚的天空。' : 'A new constellation has joined tonight’s sky.') : (chinese ? '穹顶缓缓移动，慢一点就好。' : 'The dome moves slowly — take your time.')}</p>
    </div>
  </GalleryFrame>;
}

function useRoomTone() {
  const audioRef = useRef(null);
  const [active, setActive] = useState(false);
  const toggle = () => {
    if (audioRef.current) {
      audioRef.current.oscillators.forEach((oscillator) => oscillator.stop());
      audioRef.current.context.close();
      audioRef.current = null;
      setActive(false);
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = .018;
    gain.connect(context.destination);
    const oscillators = [174.61, 261.63].map((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });
    audioRef.current = { context, oscillators };
    setActive(true);
  };
  useEffect(() => () => {
    audioRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
    audioRef.current?.context.close();
  }, []);
  return { active, toggle };
}

function ListeningRoom({ girls, onClose }) {
  const { locale } = useLocale();
  const chinese = locale === 'zh';
  const [selected, setSelected] = useState(girls[1]);
  const [playing, setPlaying] = useState(false);
  const [reading, setReading] = useState(false);
  const { active: roomTone, toggle: toggleRoomTone } = useRoomTone();
  const selectedSong = songs[selected.n];
  const playOriginal = () => {
    setPlaying(true);
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedSong[0]} ${selectedSong[1]}`)}`, '_blank', 'noopener');
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return <GalleryFrame hall="listening" title={chinese ? '聆听室' : 'Listening Room'} eyebrow={chinese ? '第四展厅 · 声音与信件' : 'Gallery four · sound and letters'} onClose={onClose}>
    <div className="listening-space">
      <div className="lounge-arch" /><div className="lounge-lamp"><i /></div><div className="lounge-shadow" />
      <section className="listening-intro"><p className="exhibit-number">{chinese ? '聆听室' : 'THE LISTENING ROOM'}</p><h1>{chinese ? '每段友谊都有自己的原声带。' : 'Every friendship has a soundtrack.'}</h1><p>{chinese ? '放下一张唱片。它转动时，一封信和一段记忆会慢慢浮现。' : 'Set a record down. While it turns, a letter and a memory come into view.'}</p></section>
      <div className="turntable-stage">
        <div className={`vinyl-record ${playing ? 'is-playing' : ''}`}><span /><i /></div>
        <div className="record-arm" /><div className="turntable-name"><span>{chinese ? '正在播放' : 'Now holding'}</span><b>{selectedSong[0]}</b><small>{selectedSong[1]} · {chinese ? `${selected.n} 选择` : `chosen by ${selected.n}`}</small></div>
      </div>
      <div className="record-shelf" aria-label={chinese ? '唱片馆藏' : 'Record collection'}>
        {girls.map((girl, index) => <button key={girl.id} className={`record-choice ${selected.id === girl.id ? 'is-selected' : ''}`} onClick={() => { setSelected(girl); setPlaying(false); }}>
          <i style={{ '--record-hue': `${(index * 31) % 360}` }} /><span>{girl.f}</span><b>{girl.n}</b>
        </button>)}
      </div>
      <motion.aside className={`listening-memory ${playing ? 'is-playing' : ''}`} key={selected.id} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }}>
        <div className="memory-image"><img src={selected.img} alt="" /><span>{selected.e}</span></div>
        <div><p>{chinese ? '馆藏来信' : 'LETTER FROM THE COLLECTION'} · {selected.city}</p><h2>“{selected.q}”</h2><small>{playing ? (chinese ? '这段记忆被唱片点亮。' : 'The memory is lit by the record.') : (chinese ? '放下唱针，让这段记忆来到眼前。' : 'Place the needle to bring this memory forward.')}</small></div>
      </motion.aside>
      <div className="listening-controls">
        <button className="room-tone" onClick={toggleRoomTone}><i>{roomTone ? '◉' : '○'}</i>{roomTone ? (chinese ? '空间声音已开启' : 'Room tone on') : (chinese ? '开启空间声音' : 'Turn on room tone')}</button>
        <button className="listen-letter" onClick={() => speak(selected.q, 'en-US', setReading)}>{reading ? (chinese ? '正在房间里朗读…' : 'Reading in the room…') : (chinese ? '朗读她的信' : 'Read her letter aloud')}</button>
        <button className="play-original" onClick={playOriginal}>{chinese ? '播放原曲' : 'Play original track'} <span>↗</span></button>
      </div>
    </div>
  </GalleryFrame>;
}

/** Full-screen, purpose-built museum rooms for collections that should not feel like website sections. */
export function GalleryExperience({ hall, girls, onClose }) {
  useEffect(() => {
    if (!hall) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hall, onClose]);

  return <AnimatePresence>
    {hall === 'language' && <LanguageGallery girls={girls} onClose={onClose} />}
    {hall === 'stars' && <StarObservatory onClose={onClose} />}
    {hall === 'listening' && <ListeningRoom girls={girls} onClose={onClose} />}
  </AnimatePresence>;
}
