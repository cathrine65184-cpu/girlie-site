import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const localKey = 'girlie-private-friendship-archives-v1';

function readLocal() {
  try { return JSON.parse(localStorage.getItem(localKey) || '[]'); } catch { return []; }
}

export function usePrivateArchive() {
  const [archives, setArchives] = useState(() => readLocal());
  const [session, setSession] = useState(null);
  const [syncState, setSyncState] = useState('local');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(localKey, JSON.stringify(archives));
  }, [archives]);

  const save = async (archive) => {
    const next = { ...archive, updatedAt: new Date().toISOString() };
    setArchives((items) => {
      const exists = items.some((item) => item.id === next.id);
      return exists ? items.map((item) => item.id === next.id ? next : item) : [next, ...items];
    });
    if (!session) return next;
    setSyncState('saving');
    const { error } = await supabase.from('friendship_archives').upsert({
      id: next.id,
      owner_id: session.user.id,
      title: next.title,
      friend_name: next.friendName || null,
      is_public: false,
      archive: next,
      updated_at: next.updatedAt,
    }, { onConflict: 'id' });
    setSyncState(error ? 'local' : 'synced');
    return next;
  };

  const remove = async (id) => {
    setArchives((items) => items.filter((item) => item.id !== id));
    if (session) await supabase.from('friendship_archives').delete().eq('id', id);
  };

  const signIn = (email, password, name) => supabase.auth.signUp({
    email, password, options: { data: { name: name || email.split('@')[0] } },
  });
  const signInExisting = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  return { archives, session, syncState, save, remove, signIn, signInExisting, signOut };
}
