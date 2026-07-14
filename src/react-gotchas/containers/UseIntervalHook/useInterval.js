import { useEffect, useRef } from 'react';

// ============================================================================
// CUSTOM HOOK: useInterval - "The Latest Ref Pattern"
// ============================================================================
//
// THE GOAL: Build a reusable useInterval(callback, delay) hook where:
//   - `callback` can be a brand-new function reference on every render
//     (e.g. an inline arrow function that closes over current state/props),
//     WITHOUT that causing the underlying setInterval to be torn down and
//     recreated every render.
//   - The interval timer itself should ONLY reset when `delay` changes.
//
// WHY THIS IS TRICKY: If we naively did
//   useEffect(() => {
//     const id = setInterval(callback, delay);
//     return () => clearInterval(id);
//   }, [callback, delay]);
// then EVERY time the parent re-renders with a new inline `callback`
// function, this effect's dependency array sees a changed value and tears
// down + recreates the interval. Best case that's wasteful; worst case it
// resets the timing (e.g. a 1s interval never actually fires because it
// keeps getting cleared before 1s elapses).
//
// THE FIX - two separate effects, one ref:
//   1. A ref (`savedCallback`) always holds the LATEST callback. A small
//      effect keeps it updated whenever `callback` changes - this effect
//      has no timer, so re-running it is cheap and has no side effects.
//   2. A SEPARATE effect sets up the actual setInterval exactly once (or
//      whenever `delay` changes), and its ticking function always calls
//      `savedCallback.current()` - i.e. it reads the ref, not the
//      original `callback` argument. Since reading a ref is always live,
//      this means the interval always invokes the MOST RECENT version of
//      the callback, even though the interval/timer itself was never torn
//      down.
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Keep the ref pointed at the latest closure, without needing to
  // re-run (or even touch) the timer-setup effect below.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Handles ONLY the timer setup/teardown. Notice `callback` is NOT in this
  // dependency array - only `delay` is. So this effect (and the interval it
  // creates) survives across re-renders where only `callback` changes.
  useEffect(() => {
    if (delay === null || delay === undefined) return; // Paused - no timer

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]); // Only resets if the duration changes
}
