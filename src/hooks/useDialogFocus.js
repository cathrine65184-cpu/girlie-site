import { useEffect, useRef } from 'react';

// Only the topmost dialog owns keyboard focus. Suspended dialogs stay mounted
// so opening a story never loses the gallery's scroll position.
export function useDialogFocus(ref, active, onClose) {
  const closeRef = useRef(onClose);
  const lastFocus = useRef(null);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const root = ref.current;
    const previous = document.activeElement;
    const controls = () => [...root.querySelectorAll('button:not(:disabled), select, a[href], [tabindex="0"]')]
      .filter((element) => element.getClientRects().length && !element.closest('[inert]'));
    const focusTarget = root.contains(lastFocus.current) ? lastFocus.current : controls()[0] || root;
    focusTarget.focus({ preventScroll: true });
    const rememberFocus = (event) => { lastFocus.current = event.target; };
    root.addEventListener('focusin', rememberFocus);
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0] || root;
      const last = items.at(-1) || root;
      if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
        event.preventDefault(); last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
        event.preventDefault(); first.focus({ preventScroll: true });
      }
    };
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('focusin', rememberFocus);
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}
