import React, { useState, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useDebouncedCallback, useStableDebouncedCallback } from './useDebouncedCallback';

// ============================================================================
// GOTCHA #11: useDebouncedCallback & the Unstable Dependency Trap
// ============================================================================
//
// THE HOOK: useDebouncedCallback(callback, delay) returns a debounced
// version of `callback` that only actually fires `delay` ms after the LAST
// call - useful for search-as-you-type, resize handlers, etc. See
// useDebouncedCallback.js in this folder for the two implementations.
//
// THE PROBLEM: the naive implementation memoizes with
//   useCallback(debouncedFn, [callback, delay])
// so the returned function's identity is only as stable as `callback`
// itself. Callers very commonly pass an inline arrow function - e.g.
//   useDebouncedCallback((q) => setQuery(q), 300)
// - which is a BRAND NEW reference every render. That means the debounced
// function returned by the hook is ALSO a new reference every render, even
// though "debounce this setter with a 300ms delay" never conceptually
// changed. Anything that depends on that function's IDENTITY - a
// React.memo'd child it's passed to as a prop, another hook's dependency
// array - sees "changed" on every render and reacts accordingly (re-render,
// re-run effect), completely defeating whatever memoization was supposed to
// happen downstream.
//
// THE FIX: useStableDebouncedCallback applies the "latest ref pattern"
// (the same trick gotcha #7's useInterval uses) - a ref always holds the
// newest callback, and the memoized debounced function reads the ref
// instead of closing over `callback` directly. Its useCallback deps become
// just [delay], so the returned function keeps the SAME identity across
// renders as long as delay doesn't change, no matter how unstable the
// caller's inline callback is.

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// A memoized child that only cares about the identity of `onSearch`. If
// `onSearch` is referentially stable, this should basically never re-render
// on its own - React.memo will skip it whenever its props are ===-equal to
// last time.
const SearchBox = memo(({ onSearch, label }) => {
  const renderCount = useRenderCount();
  return (
    <div style={{ border: '1px solid #999', padding: '0.5rem', marginBottom: '0.5rem' }}>
      <input
        type="text"
        placeholder="Type to search..."
        onChange={(e) => onSearch(e.target.value)}
        style={{ width: 200 }}
      />
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
        [{label}] SearchBox rendered <strong>{renderCount}</strong> time(s)
      </p>
    </div>
  );
});

// ----------------------------------------------------------------------------
// BROKEN: passes a fresh inline arrow function to useDebouncedCallback every
// render, so the debounced function's identity churns every render too.
// ----------------------------------------------------------------------------
function BrokenDebounceDemo() {
  const [tick, setTick] = useState(0);
  const [lastQuery, setLastQuery] = useState('(none yet)');

  // New arrow function reference every render -> useCallback's [callback,
  // delay] deps see `callback` change -> a brand new debounced function is
  // returned every render, regardless of unrelated re-renders like `tick`.
  const debouncedSearch = useDebouncedCallback((value) => {
    setLastQuery(value);
  }, 300);

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>
        Force parent re-render (unrelated tick: {tick})
      </button>
      <SearchBox onSearch={debouncedSearch} label="Broken" />
      <p>
        Last committed query: <strong>{lastQuery}</strong>
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIXED: useStableDebouncedCallback's returned function only depends on
// `delay`, so it survives the parent passing a new inline closure each time.
// ----------------------------------------------------------------------------
function FixedDebounceDemo() {
  const [tick, setTick] = useState(0);
  const [lastQuery, setLastQuery] = useState('(none yet)');

  const debouncedSearch = useStableDebouncedCallback((value) => {
    setLastQuery(value);
  }, 300);

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>
        Force parent re-render (unrelated tick: {tick})
      </button>
      <SearchBox onSearch={debouncedSearch} label="Fixed" />
      <p>
        Last committed query: <strong>{lastQuery}</strong>
      </p>
    </div>
  );
}

function UseDebounceHook() {
  return (
    <div>
      <h2>11. useDebouncedCallback & the Unstable Dependency Trap</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Click "Force parent re-render" a few times on each side: the Broken
        SearchBox's render count climbs in lock-step with the parent even
        though nothing it actually renders changed, because the debounced
        function it receives is a new reference every time. The Fixed
        SearchBox's count stays put, because its debounced function keeps
        the same identity across renders. Then type in either box - both
        still correctly debounce and commit the query 300ms after you stop
        typing; the bug here is wasted re-renders, not broken debouncing.
      </p>

      <hr />
      <h3>Broken: inline callback breaks the debounced function's identity</h3>
      <BrokenDebounceDemo />

      <hr />
      <h3>Fixed: latest-ref pattern keeps identity stable ([delay] only)</h3>
      <FixedDebounceDemo />
    </div>
  );
}

export default UseDebounceHook;
