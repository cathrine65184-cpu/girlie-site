import { useEffect, useRef, useState } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';
import { useDialogFocus } from '../hooks/useDialogFocus';

const moods = ['Soft', 'Sunny', 'Wild'];
const colors = { Soft: '#c77796', Sunny: '#dbb85e', Wild: '#d57970' };
function petals(mood) {
  const count = mood === 'Sunny' ? 12 : mood === 'Wild' ? 5 : 8;
  return Array.from({ length: count }, (_, i) => ({ angle: i * 360 / count, rx: mood === 'Sunny' ? 13 : 24, ry: mood === 'Wild' ? 39 : 33 }));
}
function FlowerDrawing({ mood }) {
  return <svg viewBox="0 0 220 260" className="friendship-flower-drawing" aria-hidden="true"><path d="M110 123 Q103 180 116 247 M111 196 Q72 170 65 186 Q76 216 112 211 M111 175 Q145 147 154 164 Q144 187 111 188" fill="none" stroke="#8a9972" strokeWidth="2" />{petals(mood).map(({ angle, rx, ry }) => <ellipse key={angle} cx="110" cy="68" rx={rx} ry={ry} transform={`rotate(${angle} 110 100)`} fill={colors[mood]} fillOpacity=".62" stroke={colors[mood]} strokeWidth=".7" />)}<circle cx="110" cy="100" r="15" fill="#e8cb86" /></svg>;
}
const xml = (text) => text.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
export function makeKeepsakeSvg(mood, title, message) {
  // Escaped plain text only. No user HTML or remote assets enter the file.
  const lines = [];
  for (const paragraph of message.split('\n')) {
    let line = ''; let width = 0;
    for (const char of [...paragraph]) {
      const nextWidth = /[^\u0000-\u007f]/.test(char) ? 2 : 1;
      if (width + nextWidth > 42) { lines.push(line); line = ''; width = 0; }
      line += char; width += nextWidth;
    }
    lines.push(line);
  }
  const height = Math.max(900, 660 + lines.length * 32);
  const flower = petals(mood).map(({ angle, rx, ry }) => `<ellipse cx="110" cy="68" rx="${rx}" ry="${ry}" transform="rotate(${angle} 110 100)" fill="${colors[mood]}" fill-opacity=".62"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}"><rect width="720" height="${height}" fill="#fff9f5"/><rect x="24" y="24" width="672" height="${height - 48}" fill="none" stroke="#d9bdc8"/><text x="360" y="85" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#624057">Girlie</text><g transform="translate(206 118) scale(1.4)"><path d="M110 123 Q103 180 116 247 M111 196 Q72 170 65 186 Q76 216 112 211" fill="none" stroke="#8a9972" stroke-width="2"/>${flower}<circle cx="110" cy="100" r="15" fill="#e8cb86"/></g><text x="360" y="530" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#624057">${xml(title)}</text>${lines.map((line, i) => `<text x="360" y="${600 + i * 32}" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#624057">${xml(line)}</text>`).join('')}<text x="360" y="${height - 60}" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#624057">♡</text></svg>`;
}

export function FriendshipFlower({ open, onClose, onPrivate, onInterview, returnFocus }) {
  const { t } = useLocale();
  const root = useRef(null);
  const heading = useRef(null);
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState('Soft');
  const [memory, setMemory] = useState('');
  const [message, setMessage] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  useDialogFocus(root, open, onClose, returnFocus);
  useEffect(() => { if (open) { root.current?.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }); } }, [step, open]);
  if (!open) return null;
  const download = () => {
    const data = makeKeepsakeSvg(mood, t(`flower${mood}Name`), message || memory);
    const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'our-girlie-flower.svg';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  };
  return <section ref={root} className="memory-reader flower-reader" role="dialog" aria-modal="true" aria-labelledby="flower-heading" tabIndex={-1} data-lenis-prevent>
    <header className="memory-reader-nav"><button onClick={onClose}>← {t('photoBack')}</button><span className="memory-meta">GIRLIE / {t('you')}</span><LocaleMenu /></header>
    {step < 3 ? <form className="flower-reflection" onSubmit={(event) => { event.preventDefault(); setStep(step + 1); }}>
      <p className="memory-meta">{t('flowerStep', { number: step + 1 })}</p><h1 ref={heading} tabIndex={-1} id="flower-heading">{t(`flowerQuestion${step + 1}`)}</h1>
      {step === 0 ? <fieldset className="flower-moods"><legend className="sr-only">{t('flowerQuestion1')}</legend>{moods.map((value) => <label key={value}><input type="radio" name="flower-mood" checked={mood === value} value={value} onChange={() => setMood(value)} /><span>{t(`flower${value}`)}</span></label>)}</fieldset>
        : <textarea aria-label={t(`flowerQuestion${step + 1}`)} value={step === 1 ? memory : message} onChange={(event) => step === 1 ? setMemory(event.target.value) : setMessage(event.target.value)} maxLength={300} placeholder={t('flowerOptional')} rows={4} />}
      <div className="flower-form-actions">{step > 0 && <button type="button" onClick={() => setStep(step - 1)}>{t('flowerPrevious')}</button>}<button className="memory-link" type="submit">{t(step === 2 ? 'flowerMake' : 'continue')} →</button></div><p className="flower-fineprint">{t('flowerPrivacy')}</p><p className="flower-fineprint">{t('flowerNote')}</p>
    </form> : step === 3 ? <div className="flower-result">
      <div className="flower-result-main"><FlowerDrawing mood={mood} /><h1 ref={heading} tabIndex={-1} id="flower-heading">{t(`flower${mood}Name`)}</h1><p>{t(`flower${mood}Body`)}</p>{memory && <blockquote>{memory}</blockquote>}{message && <p className="flower-original-message">{message}</p>}<button className="memory-link" onClick={() => setStep(0)}>{t('flowerAgain')}</button></div>
      <div className="flower-next-choices"><article><h2>{t('flowerPreserve')}</h2><p>{t('flowerPrivateBody')}</p><button className="memory-link" onClick={onPrivate}>{t('flowerPrivateCTA')} ↗</button><button className="flower-interview-link" onClick={onInterview}>{t('startInterview')} →</button></article><article><h2>{t('flowerGift')}</h2><p>{t('flowerGiftBody')}</p><button className="memory-link" onClick={() => { setStep(4); setDownloaded(false); }}>{t('flowerGiftCTA')} ↗</button></article></div><p className="flower-fineprint">{t('flowerPrivacy')}</p>
    </div> : <div className="flower-studio"><div className="flower-card-preview"><span className="girlhood-wordmark">Girlie</span><FlowerDrawing mood={mood} /><h2>{t(`flower${mood}Name`)}</h2><p>{message || memory}</p><span aria-hidden="true">♡</span></div><div><p className="memory-meta">{t('studioLabel')}</p><h1 ref={heading} tabIndex={-1} id="flower-heading">{t('studioTitle')}</h1><p>{t('studioBody')}</p><label className="studio-message-label">{t('studioMessage')}<textarea rows={5} maxLength={300} value={message} onChange={(event) => { setMessage(event.target.value); setDownloaded(false); }} /></label><button className="memory-link" onClick={download}>{t('studioDownload')} ↓</button><p role="status" className="flower-fineprint">{downloaded ? t('studioDownloaded') : '\u00a0'}</p><button className="memory-link" onClick={() => setStep(3)}>← {t('studioBack')}</button></div></div>}
  </section>;
}
