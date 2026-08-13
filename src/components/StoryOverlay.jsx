import { AnimatePresence, motion } from 'framer-motion';
import { localTime } from '../data/girls';
import { getStoryExhibit, storyExhibits } from '../data/storyExhibits';
import { getStoryExhibitZh } from '../data/storyExhibitsZh';
import { useLocale } from '../locales.jsx';

function VoiceButton({ girl, chinese }) {
  const sayWord = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(girl.word));
  };
  return <button className="voice-button" onClick={sayWord}>{chinese ? `聆听“${girl.word}”` : `Hear “${girl.word}”`}</button>;
}

function Fact({ icon, label, children }) {
  return <div className="story-fact"><span aria-hidden="true">{icon}</span><div><small>{label}</small><strong>{children}</strong></div></div>;
}

/** A slow, long-form archival reading room for each friendship. */
export function StoryOverlay({ girl, onClose, onContinue, onStartInterview }) {
  const { locale, t } = useLocale();
  const chinese = locale === 'zh';
  const exhibit = girl ? (chinese ? getStoryExhibitZh(girl) : getStoryExhibit(girl)) : null;
  const order = girl ? Math.max(0, Object.keys(storyExhibits).indexOf(girl.id)) + 1 : 0;
  const catalogue = `CAT. GP-${String(order).padStart(3, '0')}`;

  return <AnimatePresence>{girl && exhibit && <motion.aside className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label={`${girl.n}'s friendship archive`}>
    <motion.div className="story-scrim" initial={{ backdropFilter: 'blur(0px)' }} animate={{ backdropFilter: 'blur(18px)' }} exit={{ backdropFilter: 'blur(0px)' }} onClick={onClose} />
    <motion.article className="story-sheet" initial={{ y: '8%', opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: '8%', opacity: 0, scale: .985 }} transition={{ type: 'spring', stiffness: 125, damping: 22 }}>
      <button className="story-close" onClick={onClose} aria-label={t('close')}>{t('close')}</button>

      <aside className="story-profile-panel">
        <figure className="story-portrait">
          <img src={girl.img} alt={`Portrait of ${girl.n}`} />
          <span>{girl.f}</span>
        </figure>
        <div className="story-profile-copy">
          <p>{chinese ? '原始馆藏' : 'Original collection'}</p>
          <b>{chinese ? '01 · 友谊档案' : '01 · Friendship Archive'}</b>
          <i>{girl.age} {chinese ? '岁' : 'years old'} · {girl.c}</i>
        </div>
      </aside>

      <div className="story-document">
        <header className="story-header">
          <p className="story-eyebrow">{chinese ? '友谊档案' : 'Friendship Archive'} · {catalogue} · {girl.world}</p>
          <h2>{girl.n}</h2>
          <p className="story-subtitle">{girl.city} · {exhibit.title}</p>
          <blockquote>“{exhibit.quote}”</blockquote>
        </header>

        <section className="story-facts" aria-label={chinese ? '档案信息' : 'Archive details'}>
          <Fact icon="⌖" label={chinese ? '城市' : 'City'}>{girl.city}</Fact>
          <Fact icon="☁" label={chinese ? '当地气候' : 'Local climate'}>{girl.climate}</Fact>
          <Fact icon="✦" label={chinese ? '她的词语' : 'Her word'}><em>{girl.word}</em> <VoiceButton girl={girl} chinese={chinese} /></Fact>
          <Fact icon="◷" label={chinese ? '当地时间' : 'Local time'}>{localTime(girl)}</Fact>
        </section>

        <section className="story-reading">
          <p className="story-section-label">{chinese ? '我们的友谊故事' : 'Our friendship story'}</p>
          {exhibit.sections.map((section, sectionIndex) => <section className="story-chapter" key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            {section.pullQuote && <blockquote className="story-pull">“{section.pullQuote}”</blockquote>}
          </section>)}
        </section>

        {exhibit.objects.length > 0 && <section className="story-archive-objects" aria-label={chinese ? '档案物件' : 'Archive objects'}>
          <p className="story-section-label">{chinese ? '档案物件' : 'Archive objects'}</p>
          <div className="object-grid">
            {exhibit.objects.map(([name, note], index) => <article className={`object-slip object-slip-${index % 3}`} key={name}>
              <span>{String(index + 1).padStart(2, '0')}</span><b>{name}</b><small>{note}</small>
            </article>)}
          </div>
        </section>}

        <section className="story-afterword">
          <div><p>{chinese ? '友谊关键词' : 'Friendship keywords'}</p><ul>{exhibit.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul></div>
          <div><p>{chinese ? '策展人的问题' : 'Curator’s question'}</p><blockquote>{exhibit.question}</blockquote></div>
          <div><p>{chinese ? '写给世界女孩' : 'For girls everywhere'}</p><blockquote>{exhibit.message}</blockquote></div>
        </section>

        <section className="story-promise" aria-label={t('promisePreserved')}>
          <p>{chinese ? '我们守护的约定' : 'The promise we keep'}</p><b>{exhibit.promise}</b><span>♡</span>
        </section>

        <footer className="story-footer">
          <p>{chinese ? '会生长的馆藏中的一则条目。' : 'An entry in the living collection.'}</p>
          <div><button className="text-button" onClick={() => { onClose(); onStartInterview(); }}>{t('tellFriendship')} ↗</button><button className="text-button" onClick={() => { onClose(); onContinue(); }}>{chinese ? '继续参观 →' : 'Continue visiting →'}</button></div>
        </footer>
      </div>
    </motion.article>
  </motion.aside>}</AnimatePresence>;
}
