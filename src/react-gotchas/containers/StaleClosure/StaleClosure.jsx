import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #1: The Classic Stale Closure (The Interval Trap)
// ============================================================================
//
// THE SCENARIO: A counter that should increment every second.
//
// THE BUG: The component renders 0, then increments to 1 ONE time, and then
// gets stuck at 1 forever.
//
// WHY IT FAILS:
// - useEffect(() => {...}, []) runs its setup function exactly ONCE, on mount.
// - The arrow function passed to setInterval is created during that single
//   run. It "closes over" (captures) the variables that were in scope at
//   that moment - this is a JavaScript closure, not a React-specific concept.
// - At the time the effect ran, `count` was 0. That `count` binding is now
//   frozen inside the interval's callback forever, no matter how many times
//   the component re-renders afterward.
// - Every second, the interval fires and runs `setCount(0 + 1)`. It's always
//   0 + 1, because the closure never sees the updated `count` - it only ever
//   sees the snapshot of `count` from the render where the effect was set up.
// - So React re-renders once (0 -> 1), but every subsequent tick just does
//   setCount(0 + 1) again, which produces the same value 1, so React bails
//   out of re-rendering (no visible change).

function BrokenStaleCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // `count` here is captured from the render that ran this effect (mount).
      // It will ALWAYS be 0 inside this closure, forever.
      console.log('[Broken] Current count inside interval:', count);
      setCount(count + 1); // Always evaluates to setCount(0 + 1)
    }, 1000);

    return () => clearInterval(id);
  }, []); // <-- Empty dependency array: effect (and its closure) runs only once

  return <h2>Broken count: {count} (stuck at 1 after the first tick)</h2>;
}

// ----------------------------------------------------------------------------
// FIX OPTION A: Functional updates
// ----------------------------------------------------------------------------
// setCount(prevCount => prevCount + 1) does NOT rely on any variable captured
// by the closure. Instead, React calls this updater function at the moment
// it actually processes the state update, passing in whatever the CURRENT
// state is at that time. This sidesteps the stale closure problem entirely,
// and we can keep the empty dependency array (interval is created only once).
function FixedCounterFunctionalUpdate() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prevCount) => prevCount + 1); // Always reads the latest state
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h2>Fixed (functional update): {count}</h2>;
}

// ----------------------------------------------------------------------------
// FIX OPTION B: Add `count` to the dependency array
// ----------------------------------------------------------------------------
// This also works, but with a different tradeoff: every time `count` changes,
// the effect's cleanup runs (clearing the old interval) and the effect runs
// again (creating a brand new interval + a brand new closure that captures
// the fresh `count`). This resets the interval's 1-second timer on every
// tick, which is fine here since we want it to fire every second anyway, but
// could be a problem for effects where restarting has side effects.
function FixedCounterDependency() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // `count` here is fresh because the effect re-runs
    }, 1000);
    // Crucial! Without this cleanup, every re-run of the effect would stack
    // up ANOTHER interval on top of the old one, without ever removing it.
    return () => clearInterval(id);
  }, [count]);

  return <h2>Fixed (dependency array): {count}</h2>;
}

function StaleClosure() {
  return (
    <div>
      <h2>1. The Classic Stale Closure (Interval Trap)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>

      <hr />
      <BrokenStaleCounter />
      <p style={{ color: '#c0392b' }}>
        Open the console: you'll see it keep logging "Current count inside
        interval: 0" forever, even after the count on screen becomes 1.
      </p>

      <hr />
      <FixedCounterFunctionalUpdate />
      <FixedCounterDependency />
    </div>
  );
}

export default StaleClosure;
