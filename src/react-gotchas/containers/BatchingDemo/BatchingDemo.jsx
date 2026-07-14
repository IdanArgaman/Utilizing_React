import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #2: Batching and the "Sync State" Illusion
// ============================================================================
//
// THE QUESTION: If the user clicks the button once (starting from count = 0),
// what gets printed to the console, and what is the FINAL rendered count?
//
// THE ANSWER:
//   Log 1: 0
//   Log 2: 0
//   Log 3: 0   <-- yes, even inside setTimeout!
//   Final rendered count: 1
//
// WHY:
// 1. STATE IS A SNAPSHOT, NOT A LIVE VARIABLE.
//    Calling setCount does not mutate the local `count` variable in place.
//    It schedules a re-render with a NEW value for the NEXT render. Within
//    the current execution of handleClick, `count` is a constant - it stays
//    0 for the entire function body, no matter how many times you call
//    setCount.
//
// 2. AUTOMATIC BATCHING (React 18+).
//    React batches the two synchronous setCount(count + 1) calls into a
//    single re-render. Since `count` is 0 for both of them, both calls
//    resolve to setCount(0 + 1) - they overwrite each other rather than
//    stacking, so the state only ends up as 1, not 2.
//
// 3. THE setTimeout PITFALL.
//    Even though the setTimeout callback runs on a LATER event-loop tick
//    (after the component has already re-rendered with count = 1 on screen),
//    the callback is a closure that was created during the ORIGINAL call to
//    handleClick, when `count` was still 0. So it still runs
//    setCount(0 + 1), not setCount(1 + 1).

function BrokenBatchingDemo() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState([]);

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleClick = () => {
    setCount(count + 1);
    appendLog(`Log 1 (sync): count was ${count}`);

    setCount(count + 1);
    appendLog(`Log 2 (sync): count was ${count}`);

    setTimeout(() => {
      setCount(count + 1);
      appendLog(`Log 3 (setTimeout): count was ${count}`);
    }, 0);
  };

  return (
    <div>
      <button onClick={handleClick}>
        Click Me (Broken) - Current: {count}
      </button>
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// THE FIX: Functional updates queue transformations instead of values.
// ----------------------------------------------------------------------------
// setCount(prev => prev + 1) doesn't care what `count` was when the function
// was defined. Each call adds an updater function to a queue, and React runs
// that queue in order, each time feeding in whatever the result of the
// previous updater was. This is how you get TRUE sequential increments
// (0 -> 1 -> 2 -> 3) instead of three separate reads of the same stale value.
function FixedBatchingDemo() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState([]);

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleClick = () => {
    setCount((prev) => prev + 1); // Queued: 0 -> 1
    appendLog('Log 1 (functional update) queued');

    setCount((prev) => prev + 1); // Queued: 1 -> 2
    appendLog('Log 2 (functional update) queued');

    setTimeout(() => {
      setCount((prev) => prev + 1); // Queued on next tick: 2 -> 3
      appendLog('Log 3 (functional update, setTimeout) queued');
    }, 0);
  };

  return (
    <div>
      <button onClick={handleClick}>
        Click Me (Fixed) - Current: {count}
      </button>
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function BatchingDemo() {
  return (
    <div>
      <h2>2. Batching &amp; the Sync State Illusion</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>Open the console too - the same messages are logged there.</p>

      <hr />
      <h3>Broken (always reads stale `count`)</h3>
      <BrokenBatchingDemo />
      <p style={{ color: '#c0392b' }}>
        Click it once: every log line says "count was 0", and the button
        still only ends up showing 1, not 3.
      </p>

      <hr />
      <h3>Fixed (functional updates queue correctly)</h3>
      <FixedBatchingDemo />
      <p style={{ color: '#27ae60' }}>
        Click it once: the button correctly jumps by 3 (well, 2 synchronously
        + 1 after the timeout resolves).
      </p>
    </div>
  );
}

export default BatchingDemo;
