import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #14: Stale Closures in a Self-Rescheduling setTimeout Loop
// ============================================================================
//
// THE SCENARIO: A counter that reschedules its own tick via setTimeout
// instead of using setInterval:
//
//   function loopIncrement() {
//     setTimeout(() => {
//       setState(state + 1);
//       loopIncrement();
//     }, 1000);
//   }
//   useEffect(() => { loopIncrement(); }, []);
//
// THE BUG: The displayed count goes 0 -> 1 once, then never changes again,
// even though the timeout keeps firing forever (the recursive loop never
// stops - it just keeps computing the same "next" value).
//
// WHY IT FAILS (root cause: STALE CLOSURE):
// - useEffect(() => {...}, []) runs `loopIncrement` exactly once, on mount.
// - `loopIncrement` is defined once, during that same render, so its body
//   captures (closes over) `state` as it existed AT THAT MOMENT - which is 0.
// - The setTimeout callback reads `state` from that closure and calls
//   `setState(state + 1)`, i.e. `setState(0 + 1)`.
// - Crucially, `loopIncrement` then calls ITSELF again - but it's calling the
//   very same function object, still closing over the very same stale
//   `state`. Unlike setInterval (a single closure reused forever) this is a
//   fresh setTimeout each round, but it's scheduled by a function that was
//   only ever created once, so the closure never refreshes either way.
// - So every tick forever computes `setState(0 + 1)`. React renders once
//   (0 -> 1), and every tick after that calls setState(1) again with the
//   same value, which React bails out of re-rendering for.
// - This is the same root cause as gotcha #1 (interval trap), just wearing a
//   recursive-setTimeout costume instead of setInterval.

function useRenderCount() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return renderCount.current;
}

function BrokenRecursiveTimeout() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  useEffect(() => {
    let cancelled = false;

    function loopIncrement() {
      setTimeout(() => {
        if (cancelled) return;
        // `count` here is captured from the render that ran this effect
        // (mount). It will ALWAYS be 0 inside this closure, forever -
        // `loopIncrement` itself was only ever defined once.
        console.log('[Broken] count inside timeout closure:', count);
        setCount(count + 1); // Always evaluates to setCount(0 + 1)
        loopIncrement();
      }, 1000);
    }

    loopIncrement();
    return () => {
      cancelled = true;
    };
  }, []); // <-- Empty dependency array: effect (and its one closure) runs only once

  return (
    <div>
      <h3>Broken count: {count} (stuck at 1 after the first tick)</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIX OPTION A: Functional state update
// ----------------------------------------------------------------------------
// setCount(prev => prev + 1) never reads the closed-over `count` variable at
// all - React supplies the current state at the moment it actually applies
// the update. The recursive setTimeout chain can keep reusing the exact same
// stale closure forever; it no longer matters, because that closure never
// needs to know the current count.
function FixedFunctionalUpdate() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  useEffect(() => {
    let cancelled = false;

    function loopIncrement() {
      setTimeout(() => {
        if (cancelled) return;
        setCount((prev) => prev + 1); // Always reads the latest state
        loopIncrement();
      }, 1000);
    }

    loopIncrement();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h3>Fixed (functional update): {count}</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIX OPTION B: Latest-value ref (mirrors gotcha #7's "latest ref pattern")
// ----------------------------------------------------------------------------
// Keep a ref that is updated on every render to always hold the current
// `count`. The setTimeout closure still only ever sees the ref object it
// captured at mount, but a ref's `.current` is mutable and shared, so reading
// `countRef.current` at fire-time always sees the freshest value - even
// though the closure itself is never recreated.
function FixedLatestRef() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const renderCount = useRenderCount();

  // Runs after every render, so countRef.current is always in sync with the
  // most recently rendered `count` by the time the next timeout fires.
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    let cancelled = false;

    function loopIncrement() {
      setTimeout(() => {
        if (cancelled) return;
        setCount(countRef.current + 1); // Reads the ref, not the stale closure variable
        loopIncrement();
      }, 1000);
    }

    loopIncrement();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h3>Fixed (latest ref): {count}</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIX OPTION C: Depend on `count` and rebuild the closure every tick
// ----------------------------------------------------------------------------
// Instead of scheduling once and recursing forever inside a single stale
// closure, let the effect itself depend on `count`. Every time `count`
// changes, the old timeout is cleared and a brand-new one is scheduled,
// wrapping a brand-new closure that captures the fresh `count`. This is the
// most direct translation of the original buggy code's intent, but note the
// tradeoff called out in gotcha #1's "Fix Option B": this resets the
// 1-second timer on every tick (harmless here, but worth knowing).
function FixedDependencyArray() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  useEffect(() => {
    const id = setTimeout(() => {
      setCount(count + 1); // `count` here is fresh because the effect re-runs
    }, 1000);
    // Crucial! Without this cleanup, a fast-changing dependency could leave
    // stray timeouts running, though here it just avoids a double-schedule.
    return () => clearTimeout(id);
  }, [count]);

  return (
    <div>
      <h3>Fixed (dependency array): {count}</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIX OPTION D: useCallback + functional update, self-scheduled via effect
// ----------------------------------------------------------------------------
// A more "hooks idiomatic" shape: `tick` is memoized with useCallback (empty
// deps, since it only uses the functional updater form and never reads
// `count` directly), and the effect just kicks off - and re-arms - the
// timeout. Combines fix A's closure-proofing with fix C's effect-driven
// scheduling for a version that reads naturally.
function FixedCallbackAndEffect() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  const tick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const id = setTimeout(tick, 1000);
    return () => clearTimeout(id);
  }, [tick, count]);  // depend on `count` to create a new timeout every tick, but `tick` itself is stable

  return (
    <div>
      <h3>Fixed (useCallback + functional update): {count}</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIX OPTION E: Sidestep recursion entirely with setInterval
// ----------------------------------------------------------------------------
// The original bug only exists because the code hand-rolls its own repeating
// timer via a function that reschedules itself with setTimeout. `setInterval`
// already does that job natively - schedule once, fire forever, no recursive
// re-scheduling function to worry about. Combined with the functional update
// form (fix A), there's no closure to go stale at all: nothing here ever
// reads `count` directly.
function FixedSetInterval() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + 1); // Functional update - no stale `count` read
    }, 1000);
    return () => clearInterval(id);
  }, []); // Set up once; setInterval itself handles the repeating, not our code

  return (
    <div>
      <h3>Fixed (setInterval): {count}</h3>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount} time(s).
      </p>
    </div>
  );
}

function RecursiveTimeoutLoop() {
  return (
    <div>
      <h2>14. Stale Closures in a Self-Rescheduling setTimeout Loop</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        The broken version below reschedules itself with{' '}
        <code>setTimeout</code> forever, but the on-screen count still gets
        stuck at 1 after the first tick - the classic{' '}
        <strong>stale closure</strong> bug (same root cause as gotcha #1's
        interval trap), just hiding inside a recursive function instead of
        `setInterval`.
      </p>

      <hr />
      <BrokenRecursiveTimeout />
      <p style={{ color: '#c0392b' }}>
        Open the console: it keeps logging "count inside timeout closure: 0"
        every second forever, even after the count on screen becomes 1.
      </p>

      <hr />
      <FixedFunctionalUpdate />
      <FixedLatestRef />
      <FixedDependencyArray />
      <FixedCallbackAndEffect />
      <FixedSetInterval />
    </div>
  );
}

export default RecursiveTimeoutLoop;
