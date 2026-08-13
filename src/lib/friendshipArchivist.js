import { archivistEndpoint, supabase } from './supabase';

const questions = [
  'Do you remember the first thing you noticed about her?',
  'Was she someone you liked immediately, or did you grow into the friendship?',
  'Where were you when you realised she was becoming important to you?',
  'Is there one moment — big or small — that you return to whenever you think of the two of you?',
  'What is something completely ordinary that still reminds you of her?',
  'Have the two of you ever had a season of distance, silence, or finding your way back?',
  'What is one object, place, or small ritual that belongs only to the two of you?',
  'What does she understand about you that almost nobody else does?',
  'What do you love most about who she is in your life?',
  'If you could leave her one message inside this archive, what would you want her to know?',
  'Imagine ten years from now. What do you hope the two of you will still remember?',
];

const chineseQuestions = [
  '你还记得第一次注意到她时，是什么样子吗？',
  '你们是一开始就投缘，还是慢慢长成了朋友？',
  '你在哪里意识到，她正在变得很重要？',
  '每次想起你们时，有没有一个无论大小、总会回到你心里的瞬间？',
  '有什么再普通不过的小事，至今仍让你想起她？',
  '你们有过疏远、沉默或重新找到彼此的阶段吗？',
  '有什么物件、地点或小习惯，只属于你们两个人？',
  '有什么关于你自己的事，几乎只有她真正懂？',
  '在你的生命里，你最喜欢她的是什么？',
  '如果可以在这份档案里留一句话给她，你想让她知道什么？',
  '想象十年以后：你希望你们还会记得什么？',
];

export const initialInterview = (locale = 'en') => [{ id: 'welcome', role: 'assistant', content: locale === 'zh' ? '我们从一个简单的地方开始吧。你们第一次见面是什么时候？' : "Let's start somewhere easy. When did you first meet her?" }];

function localReply(messages, locale = 'en') {
  const answers = messages.filter((message) => message.role === 'user');
  const bank = locale === 'zh' ? chineseQuestions : questions;
  const next = bank[Math.min(Math.max(answers.length - 1, 0), bank.length - 1)];
  if (answers.length >= bank.length) {
    return locale === 'zh' ? '我已经能感到这段友谊的轮廓了。准备好时，我们可以把这些记忆整理进你的私密档案——除非你决定分享，否则没有任何内容会公开。' : "I can already feel the shape of this friendship. When you're ready, we can turn these memories into your private archive — nothing is public unless you decide it should be.";
  }
  return next;
}

/**
 * Uses the server-side Edge Function when a signed-in user has connected it.
 * The local path deliberately stays private to the current browser and never
 * invents facts; it makes the first use of the product possible before login.
 */
export async function askArchivist(messages, draft, locale = 'en') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { reply: localReply(messages, locale), extraction: null, source: 'local' };

  try {
    const response = await fetch(archivistEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: 'interview', messages, archive: draft, locale }),
    });
    if (!response.ok) throw new Error('Archivist is not connected yet.');
    const body = await response.json();
    if (!body.reply) throw new Error('No archivist reply received.');
    return { ...body, source: 'ai' };
  } catch {
    return { reply: localReply(messages, locale), extraction: null, source: 'local' };
  }
}

function titleFrom(messages, locale = 'en') {
  const first = messages.find((message) => message.role === 'user')?.content?.trim();
  if (locale === 'zh') return first ? '一段仍在书写的友谊' : '未命名的友谊';
  return first ? 'A friendship, still being written' : 'Untitled friendship';
}

function storyFrom(messages, locale = 'en') {
  const lines = messages.filter((message) => message.role === 'user').map((message) => message.content.trim()).filter(Boolean);
  if (!lines.length) return locale === 'zh' ? '这份档案正在等待第一段记忆。' : 'This archive is waiting for the first memory.';
  const opening = lines[0];
  const middle = lines.slice(1, -1);
  const closing = lines.at(-1);
  if (locale === 'zh') return [
    `这段友谊从一段记忆开始：“${opening}”`,
    middle.length ? `随着故事慢慢打开，更多片段出现了——${middle.map((line) => `“${line}”`).join(' ')}` : '',
    closing && closing !== opening ? `此刻，有一句话仍被轻轻珍藏：“${closing}”` : '',
    '这里保留的，只是你愿意分享的细节。其余的可以一直私密，也可以等合适的时候再慢慢添上。',
  ].filter(Boolean).join('\n\n');
  return [
    `This friendship begins with a memory: “${opening}”`,
    middle.length ? `As the archive opened, more traces appeared — ${middle.map((line) => `“${line}”`).join(' ')}.` : '',
    closing && closing !== opening ? `For now, one thought stays close: “${closing}”` : '',
    'These are only the details that were shared here. The rest can remain private, or be added when the time feels right.',
  ].filter(Boolean).join('\n\n');
}

/** A factual, private local draft — never a fabricated AI story. */
export function createLocalArchive(messages, extraction = null, locale = 'en') {
  const now = new Date().toISOString();
  const answers = messages.filter((message) => message.role === 'user').map((message) => message.content.trim()).filter(Boolean);
  const objects = extraction?.objects || [];
  const timeline = extraction?.timeline || answers.slice(0, 4).map((memory, index) => ({
    id: crypto.randomUUID(),
    date: '',
    title: index === 0 ? 'The first memory' : `Memory ${index + 1}`,
    note: memory,
  }));
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    title: extraction?.title || titleFrom(messages, locale),
    friendName: extraction?.friend_name || '',
    // Kept as structured, private material for future archive views. The
    // original interview remains alongside it and is never replaced.
    profile: {
      friendName: extraction?.friend_name || '',
      location: extraction?.location || '',
      howMet: extraction?.how_met || '',
      firstMemory: extraction?.first_memory || answers[0] || '',
      themes: extraction?.themes || extraction?.keywords || [],
    },
    privacy: 'private',
    interview: messages,
    story: { version: 1, content: extraction?.story || storyFrom(messages, locale), source: extraction?.story ? 'ai-assisted' : 'your words' },
    versions: [{ version: 1, createdAt: now, content: extraction?.story || storyFrom(messages, locale) }],
    timeline,
    places: extraction?.places || [],
    objects,
    keywords: extraction?.keywords || [],
    quote: extraction?.quote || answers.at(-1) || '',
    letter: extraction?.letter || '',
    capsule: { openIn: '5 years', hope: '', locked: false },
  };
}

/**
 * The service may turn disclosed facts into a readable private story, but the
 * original interview stays intact on the archive. Without the service, build
 * the same factual structure locally from the user's words.
 */
export async function finalizeArchive(messages, draft = null, locale = 'en') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return createLocalArchive(messages, draft, locale);
  try {
    const response = await fetch(archivistEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ mode: 'finalize', messages, archive: draft || {}, locale }),
    });
    if (!response.ok) throw new Error('Archivist is not connected yet.');
    const extraction = await response.json();
    return createLocalArchive(messages, { ...(draft || {}), ...extraction }, locale);
  } catch {
    return createLocalArchive(messages, draft, locale);
  }
}
