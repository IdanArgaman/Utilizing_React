import { useCallback, useEffect, useRef } from 'react';

// ============================================================================
// CUSTOM HOOK: useDebouncedCallback
// ============================================================================
//
// THE GOAL: wrap a callback so that rapid-fire calls to the returned function
// collapse into a single call, `delay` ms after the LAST call - e.g. only
// fire a search request once the user stops typing for 300ms.
//
// THE CATCH: useCallback's dependency array is [callback, delay]. That means
// the STABILITY of the returned debounced function is only as good as the
// STABILITY of the `callback` you pass in. If the caller passes a fresh
// inline arrow function on every render (extremely common - e.g. `(q) =>
// setQuery(q)`), useCallback sees a changed dependency and returns a BRAND
// NEW debounced function every render. Each new function has its own fresh
// `timeoutRef.current` closure at call time, but because the OLD debounced
// function instance is discarded, any pending timeout that a previous
// instance already scheduled is orphaned - it still exists (this hook's own
// cleanup effect only clears the LATEST timeoutRef on unmount, not on every
// re-render), so it fires anyway once its delay elapses, but the calling
// component has already moved on to a new function reference. In practice
// this shows up as: identity-sensitive consumers (React.memo children,
// other useEffect/useCallback deps) see "the debounced function changed"
// every render, defeating memoization even though nothing meaningful
// changed - the exact same referential-identity trap as gotcha #4/#9, just
// one level removed inside a custom hook.
export function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);

  /*
    cleanup-on-unmount:
    without it, if the component unmounts while a debounce timer is still pending,
    the setTimeout fires anyway after unmount and calls callback(...args) — which,
    in the demo's case, calls a setState setter on an unmounted component.
  */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// ----------------------------------------------------------------------------
// THE FIX: the "latest ref pattern" (same trick as gotcha #7's useInterval).
// Keep a ref pointed at the newest `callback` via a cheap effect, and make
// the memoized debounced function read `savedCallback.current` instead of
// closing over `callback` directly. Now the returned function's identity
// depends ONLY on `delay` - it stays stable across renders even when the
// caller passes a brand-new inline callback every time.
export function useStableDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

   /*
    cleanup-on-unmount:
    without it, if the component unmounts while a debounce timer is still pending,
    the setTimeout fires anyway after unmount and calls callback(...args) — which,
    in the demo's case, calls a setState setter on an unmounted component.
  */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        savedCallback.current(...args);
      }, delay);
    },
    [delay] // No `callback` here - identity now survives inline closures.
  );
}
