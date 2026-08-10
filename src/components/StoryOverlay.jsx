import { AnimatePresence, motion } from 'framer-motion';
import { localTime } from '../data/girls';
import { getStoryExhibit, storyExhibits } from '../data/storyExhibits';

function VoiceButton({ girl }) {
  const sayWord = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(girl.word));
  };
  return <button className="voice-button" onClick={sayWord}>Hear “{girl.word}”</button>;
}

function Fact({ icon, label, children }) {
  return <div className="story-fact"><span aria-hidden="true">{icon}</span><div><small>{label}</small><strong>{children}</strong></div></div>;
}

/** A slow, long-form archival reading room for each friendship. */
export function StoryOverlay({ girl, onClose, onContinue, studioHref }) {
  const exhibit = girl ? getStoryExhibit(girl) : null;
  const order = girl ? Math.max(0, Object.keys(storyExhibits).indexOf(girl.id)) + 1 : 0;
  const catalogue = `CAT. GP-${String(order).padStart(3, '0')}`;

  return <AnimatePresence>{girl && exhibit && <motion.aside className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label={`${girl.n}'s friendship archive`}>
    <motion.div className="story-scrim" initial={{ backdropFilter: 'blur(0px)' }} animate={{ backdropFilter: 'blur(18px)' }} exit={{ backdropFilter: 'blur(0px)' }} onClick={onClose} />
    <motion.article className="story-sheet" initial={{ y: '8%', opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: '8%', opacity: 0, scale: .985 }} transition={{ type: 'spring', stiffness: 125, damping: 22 }}>
      <button className="story-close" onClick={onClose} aria-label="Close story">Close ×</button>

      <aside className="story-profile-panel">
        <figure className="story-portrait">
          <img src={girl.img} alt={`Portrait of ${girl.n}`} />
          <span>{girl.f}</span>
        </figure>
        <div className="story-profile-copy">
          <p>Original collection</p>
          <b>01 · Friendship Archive</b>
          <i>{girl.age} years old · {girl.c}</i>
        </div>
      </aside>

      <div className="story-document">
        <header className="story-header">
          <p className="story-eyebrow">Friendship Archive · {catalogue} · {girl.world}</p>
          <h2>{girl.n}</h2>
          <p className="story-subtitle">{girl.city} · {exhibit.title}</p>
          <blockquote>“{exhibit.quote}”</blockquote>
        </header>

        <section className="story-facts" aria-label="Archive details">
          <Fact icon="⌖" label="City">{girl.city}</Fact>
          <Fact icon="☁" label="Local climate">{girl.climate}</Fact>
          <Fact icon="✦" label="Her word"><em>{girl.word}</em> <VoiceButton girl={girl} /></Fact>
          <Fact icon="◷" label="Local time">{localTime(girl)}</Fact>
        </section>

        <section className="story-reading">
          <p className="story-section-label">Our friendship story</p>
          {exhibit.sections.map((section, sectionIndex) => <section className="story-chapter" key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            {section.pullQuote && <blockquote className="story-pull">“{section.pullQuote}”</blockquote>}
          </section>)}
        </section>

        <section className="story-archive-objects" aria-label="Archive objects">
          <p className="story-section-label">Archive objects</p>
          <div className="object-grid">
            {exhibit.objects.map(([name, note], index) => <article className={`object-slip object-slip-${index % 3}`} key={name}>
              <span>{String(index + 1).padStart(2, '0')}</span><b>{name}</b><small>{note}</small>
            </article>)}
          </div>
        </section>

        <section className="story-afterword">
          <div><p>Friendship keywords</p><ul>{exhibit.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul></div>
          <div><p>Curator’s question</p><blockquote>{exhibit.question}</blockquote></div>
          <div><p>For girls everywhere</p><blockquote>{exhibit.message}</blockquote></div>
        </section>

        <section className="story-promise" aria-label="A promise preserved in the archive">
          <p>The promise we keep</p><b>{exhibit.promise}</b><span>♡</span>
        </section>

        <footer className="story-footer">
          <p>An entry in the living collection.</p>
          <div><a className="text-button" href={studioHref}>Build a Secret House ↗</a><button className="text-button" onClick={() => { onClose(); onContinue(); }}>Continue visiting →</button></div>
        </footer>
      </div>
    </motion.article>
  </motion.aside>}</AnimatePresence>;
}
