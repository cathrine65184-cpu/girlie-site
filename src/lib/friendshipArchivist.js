import { archivistEndpoint, supabase } from './supabase';

const start = {
  id: 'welcome',
  role: 'assistant',
  content: "Let's start somewhere easy. When did you first meet her?",
};

const gentleQuestions = [
  'Do you remember the first thing you noticed about her?',
  'Was she someone you liked immediately, or did you grow into the friendship?',
  'Where were you when you realised she was becoming important to you?',
  'What is something completely ordinary that still reminds you of her?',
  'Have the two of you ever had a season of distance, silence, or finding your way back?',
  'What is one object, place, or small ritual that belongs only to the two of you?',
  'Imagine ten years from now. What do you hope the two of you will still remember?',
];

export const initialInterview = [start];

function localReply(messages) {
  const answers = messages.filter((message) => message.role === 'user');
  const next = gentleQuestions[Math.min(Math.max(answers.length - 1, 0), gentleQuestions.length - 1)];
  if (answers.length >= gentleQuestions.length) {
    return "I can already feel the shape of this friendship. When you're ready, we can turn these memories into your private archive — nothing is public unless you decide it should be.";
  }
  return next;
}

/**
 * Uses the server-side Edge Function when a signed-in user has connected it.
 * The local path deliberately stays private to the current browser and never
 * invents facts; it makes the first use of the product possible before login.
 */
export async function askArchivist(messages, draft) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { reply: localReply(messages), extraction: null, source: 'local' };

  try {
    const response = await fetch(archivistEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: 'interview', messages, archive: draft }),
    });
    if (!response.ok) throw new Error('Archivist is not connected yet.');
    const body = await response.json();
    if (!body.reply) throw new Error('No archivist reply received.');
    return { ...body, source: 'ai' };
  } catch {
    return { reply: localReply(messages), extraction: null, source: 'local' };
  }
}

function titleFrom(messages) {
  const first = messages.find((message) => message.role === 'user')?.content?.trim();
  return first ? 'A friendship, still being written' : 'Untitled friendship';
}

function storyFrom(messages) {
  const lines = messages.filter((message) => message.role === 'user').map((message) => message.content.trim()).filter(Boolean);
  if (!lines.length) return 'This archive is waiting for the first memory.';
  const opening = lines[0];
  const middle = lines.slice(1, -1);
  const closing = lines.at(-1);
  return [
    `This friendship begins with a memory: “${opening}”`,
    middle.length ? `As the archive opened, more traces appeared — ${middle.map((line) => `“${line}”`).join(' ')}.` : '',
    closing && closing !== opening ? `For now, one thought stays close: “${closing}”` : '',
    'These are only the details that were shared here. The rest can remain private, or be added when the time feels right.',
  ].filter(Boolean).join('\n\n');
}

/** A factual, private local draft — never a fabricated AI story. */
export function createLocalArchive(messages, extraction = null) {
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
    title: extraction?.title || titleFrom(messages),
    friendName: extraction?.friend_name || '',
    privacy: 'private',
    interview: messages,
    story: { version: 1, content: extraction?.story || storyFrom(messages), source: extraction?.story ? 'ai-assisted' : 'your words' },
    versions: [{ version: 1, createdAt: now, content: extraction?.story || storyFrom(messages) }],
    timeline,
    places: extraction?.places || [],
    objects,
    keywords: extraction?.keywords || [],
    quote: extraction?.quote || answers.at(-1) || '',
    letter: extraction?.letter || '',
    capsule: { openIn: '5 years', hope: '', locked: false },
  };
}
