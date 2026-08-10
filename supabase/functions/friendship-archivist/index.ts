import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://cathrine65184-cpu.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]);

const jsonHeaders = (origin: string | null) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://cathrine65184-cpu.github.io',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  Vary: 'Origin',
});

const archivistSystem = `You are the Friendship Archivist for Girlie Project, a private digital museum of women’s friendships.
You are warm, curious, observant, lightly poetic, and never judgemental. You are not a therapist and never diagnose or pressure a user to disclose private information.
Ask one gentle, specific follow-up question at a time. If a user skips or declines, say that it is okay and move on naturally.
Never invent facts. Never assume names, dates, locations, identities, causes, emotions, or events that were not given.
Return valid JSON only. For mode "interview", return {"reply": string, "extraction": {"friend_name"?: string, "timeline"?: [{"date"?: string,"title": string,"note": string}], "places"?: [{"name": string,"note": string}], "objects"?: [{"name": string,"note": string}], "keywords"?: string[], "quote"?: string}}. Extract only facts explicitly supplied in the conversation.
For mode "finalize", return {"story": string, "timeline": [], "places": [], "objects": [], "keywords": [], "quote": string, "letter": string}. The story must be 300-800 words, literary but factual, and include no detail that the user did not supply. Label the letter as AI-assisted. If there is insufficient detail, say so plainly rather than inventing.`;

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (request.method === 'OPTIONS') return new Response('ok', { headers: jsonHeaders(origin) });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: jsonHeaders(origin) });

  const authorization = request.headers.get('Authorization');
  if (!authorization) return new Response(JSON.stringify({ error: 'Sign in is required for a private interview.' }), { status: 401, headers: jsonHeaders(origin) });

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return new Response(JSON.stringify({ error: 'Your private room could not be verified.' }), { status: 401, headers: jsonHeaders(origin) });

  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'The archivist is not connected yet.' }), { status: 503, headers: jsonHeaders(origin) });

  try {
    const { mode = 'interview', messages = [], archive = {} } = await request.json();
    const safeMessages = Array.isArray(messages) ? messages.slice(-28).map(({ role, content }) => ({
      role: role === 'assistant' ? 'assistant' : 'user', content: String(content || '').slice(0, 5000),
    })) : [];
    const deepseek = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat',
        temperature: .72,
        max_tokens: mode === 'finalize' ? 1800 : 520,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: archivistSystem },
          { role: 'user', content: `Mode: ${mode}. Produce JSON. Conversation: ${JSON.stringify(safeMessages)}. Existing private archive facts: ${JSON.stringify(archive)}` },
        ],
      }),
    });
    if (!deepseek.ok) throw new Error(`Model request failed (${deepseek.status}).`);
    const payload = await deepseek.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error('The archivist returned an empty response.');
    return new Response(content, { headers: jsonHeaders(origin) });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'The archivist could not respond.' }), { status: 500, headers: jsonHeaders(origin) });
  }
});
