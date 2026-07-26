import { useEffect } from 'react';

// ============================================================================
// CUSTOM HOOKS: useWindowEvent / useDocumentEvent - "Correlated Generics"
// ============================================================================
//
// THE GOAL: A typed wrapper around addEventListener/removeEventListener where
// the `handler` parameter's event type automatically matches whichever
// `event` string you passed as the first argument - so
// useWindowEvent('resize', (e) => ...) infers `e: UIEvent`, while
// useWindowEvent('keydown', (e) => ...) infers `e: KeyboardEvent`, with zero
// manual annotation and a compile error if you get it wrong.
//
// HOW THE GENERIC ACTUALLY WORKS:
//   - `WindowEventMap` is a built-in TS lib type: an interface mapping every
//     known event name (as a string literal key) to its specific event type,
//     e.g. { resize: UIEvent; keydown: KeyboardEvent; click: MouseEvent; ... }.
//   - `K extends keyof WindowEventMap` means K can be ANY key of that map
//     ('resize', 'keydown', 'click', etc.) - but K is INFERRED from whatever
//     literal string you actually pass as `event`, not left as the full union.
//   - Because `handler`'s parameter type is written as `WindowEventMap[K]`
//     (an INDEXED ACCESS using that SAME inferred K, not a hardcoded Event),
//     TypeScript correlates the two parameters: once K is pinned down by
//     argument #1, argument #2's type is looked up from the map using that
//     exact K. This is sometimes called a "correlated union" - the compiler
//     narrows the handler's event type per call-site instead of forcing it
//     to accept the union of all possible DOM events.
//   - Passing a typo'd event name (e.g. 'resze') is a compile error too,
//     since `event` is constrained to `keyof WindowEventMap`.
//
// WHY BOTH window AND document VERSIONS EXIST: window and document don't
// listen for the exact same set of events (e.g. 'DOMContentLoaded' only
// fires on document; 'resize' only fires on window in the way most people
// mean it). TypeScript ships separate `WindowEventMap` and
// `DocumentEventMap` interfaces for this reason, so useDocumentEvent uses
// its own generic constrained to DocumentEventMap instead of reusing
// useWindowEvent's.
//
// RUNTIME BEHAVIOR: standard subscribe-in-effect, unsubscribe-in-cleanup.
// `event` and `handler` are both effect dependencies, so passing a new
// inline `handler` function on every render re-subscribes on every render.
// If that matters for your use case, stabilize `handler` yourself
// (useCallback, or the "latest ref" pattern from gotcha #7's useInterval
// hook - see the sibling UseIntervalHook/useInterval.js) before passing it
// in here.

export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void
) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
}

export function useDocumentEvent<K extends keyof DocumentEventMap>(
  event: K,
  handler: (event: DocumentEventMap[K]) => void
) {
  useEffect(() => {
    document.addEventListener(event, handler);
    return () => document.removeEventListener(event, handler);
  }, [event, handler]);
}
