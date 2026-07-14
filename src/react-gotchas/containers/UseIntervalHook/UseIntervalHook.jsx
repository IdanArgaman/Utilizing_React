import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInterval } from './useInterval';

// ============================================================================
// GOTCHA #7: Custom Hooks & the "Latest Ref Pattern" (useInterval)
// ============================================================================
//
// This demo shows the useInterval hook (see useInterval.js in this folder)
// solving gotcha #1's stale-closure problem WITHOUT needing to reset the
// interval's timer whenever `count` changes (unlike "Fix Option B" back in
// StaleClosure.jsx, which resets the 1-second timer on every tick).
//
// Here, the interval is set up exactly ONCE (delay never changes), but the
// callback we pass in is a fresh inline arrow function on every render that
// reads the LATEST `count` and `step` via normal closure - and it still
// works correctly, because useInterval's internal ref always has the newest
// version of that callback.

function BasicIntervalCounter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const renderCount = useRef(0);
  renderCount.current += 1;

  // This inline arrow function is a BRAND NEW reference every single render
  // (because `step` is captured in its closure). With a naive
  // useEffect([callback, delay]) implementation, this would tear down and
  // recreate setInterval every render. With the latest-ref-pattern
  // useInterval, the timer is created once and just keeps calling whatever
  // the newest version of this function is.
  useInterval(() => {
    setCount((c) => c + step);
  }, 1000);

  return (
    <div>
      <p>
        Count: <strong>{count}</strong> (incrementing by {step} every second)
      </p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Parent re-rendered {renderCount.current} time(s) - notice the
        interval never resets even though a new callback closure is created
        on every render.
      </p>
      <label>
        Step size:{' '}
        <input
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) || 0)}
          style={{ width: 60 }}
        />
      </label>
    </div>
  );
}

function PausableIntervalCounter() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Passing `delay: null` is how useInterval "pauses" - the timer-setup
  // effect sees delay is null/undefined and simply returns early without
  // creating a new setInterval.
  useInterval(() => setCount((c) => c + 1), isRunning ? 1000 : null);

  return (
    <div>
      <p>
        Pausable count: <strong>{count}</strong>
      </p>
      <button onClick={() => setIsRunning((r) => !r)}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}

function UseIntervalHook() {
  return (
    <div>
      <h2>7. Custom Hooks: The "Latest Ref Pattern" (useInterval)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Change the step size while the counter is running - the interval
        keeps ticking on schedule and immediately picks up the new step,
        without ever being torn down and rebuilt.
      </p>

      <hr />
      <h3>Interval with a changing callback (step size)</h3>
      <BasicIntervalCounter />

      <hr />
      <h3>Interval that can be paused (delay: null)</h3>
      <PausableIntervalCounter />
    </div>
  );
}

export default UseIntervalHook;
