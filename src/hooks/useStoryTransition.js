import { useCallback, useEffect, useMemo, useState } from 'react';

const storageKey = 'girlie-memory-blooms';

export function useStoryTransition() {
  const [activeId, setActiveId] = useState(null);
  const [visited, setVisited] = useState(() => new Set());

  useEffect(() => {
    try { setVisited(new Set(JSON.parse(sessionStorage.getItem(storageKey) || '[]'))); } catch { /* optional */ }
  }, []);

  const openStory = useCallback((id) => {
    setActiveId(id);
    setVisited((current) => {
      const next = new Set(current).add(id);
      try { sessionStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* optional */ }
      return next;
    });
  }, []);

  return useMemo(() => ({ activeId, visited, openStory, closeStory: () => setActiveId(null) }), [activeId, openStory, visited]);
}
