import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #12: Queueing State Updates - Mixing Values and Updater Functions
// ============================================================================
// See: https://react.dev/learn/queueing-a-series-of-state-updates
//
// (Gotcha #2 already covers the basic "value vs. updater function" stale-
// closure trap, including the setTimeout pitfall - go read that one first if
// you haven't. This gotcha is about a DIFFERENT, more surprising rule that
// only shows up once you start MIXING the two styles in the same handler.)
//
// THE MENTAL MODEL: calling setState during an event handler doesn't apply
// updates immediately - it pushes an entry onto a QUEUE for that state
// variable. React processes the whole queue in order right before the next
// render. Each entry is either:
//   - a REPLACEMENT value:      setNumber(5)       -> "replace with 5"
//   - an UPDATER function:      setNumber(n => n+1) -> "apply this transform
//                                                       to whatever the queue
//                                                       currently holds"
//
// THE GOTCHA: a REPLACEMENT value does not "add itself to the running
// total" - it throws away every queued entry that came before it and
// becomes the new base to build on. Only updater functions actually chain
// off of each other. So the ORDER you mix values and updaters in matters a
// lot, and it's easy to write code that looks like it should accumulate
// three separate bonuses when it actually only keeps the last one.
//
// Given starting score = 10, clicking a button that runs:
//   setScore(score + 5);   // "replace with 15" (score is 10 in this closure)
//   setScore(s => s + 1);  // queued transform: 15 -> 16
//   setScore(s => s + 1);  // queued transform: 16 -> 17
// correctly produces 17, because the PLAIN VALUE happens to be first, so
// the updater functions afterward chain off of it correctly.
//
// But swap the order - updater functions FIRST, plain value LAST - and the
// plain value wipes out everything queued before it:
//   setScore(s => s + 1);  // queued transform: 10 -> 11
//   setScore(s => s + 1);  // queued transform: 11 -> 12
//   setScore(score + 5);   // "replace with 15" <- DISCARDS the queue above!
// Final result: 15, not 17 - the two +1 updater calls silently vanish,
// because `score` was captured as 10 at the top of the handler and the
// literal "replace with 15" instruction doesn't care what came before it in
// the queue.

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ----------------------------------------------------------------------------
// BROKEN: updater functions queued first, then a plain value last - the
// plain value clobbers the queued transforms instead of stacking with them.
// ----------------------------------------------------------------------------
function BrokenQueueDemo() {
  const [score, setScore] = useState(10);
  const [log, setLog] = useState([]);
  const renderCount = useRenderCount();

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleClick = () => {
    appendLog(`--- click (score was ${score} at start of handler) ---`);

    setScore((s) => s + 1); // queued transform: +1
    appendLog('queued: s => s + 1');

    setScore((s) => s + 1); // queued transform: +1
    appendLog('queued: s => s + 1');

    setScore(score + 5); // "replace with (score + 5)" - WIPES the queue above!
    appendLog(`queued: REPLACE with ${score} + 5 = ${score + 5} (discards both updaters above)`);
  };

  return (
    <div style={{ border: '1px solid #c0392b', padding: '0.5rem' }}>
      <p>
        [Broken] Score: <strong>{score}</strong> (render #{renderCount})
      </p>
      <button onClick={handleClick}>+1, +1, then +5 (as a plain value)</button>
      <ul style={{ fontSize: '0.85rem' }}>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIXED: use updater functions consistently, including for the "+5 bonus".
// Every entry in the queue now chains off of whatever came before it, so
// order no longer matters and all three bonuses actually stack.
// ----------------------------------------------------------------------------
function FixedQueueDemo() {
  const [score, setScore] = useState(10);
  const [log, setLog] = useState([]);
  const renderCount = useRenderCount();

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleClick = () => {
    appendLog('--- click ---');

    setScore((s) => s + 1); // queued transform: +1
    appendLog('queued: s => s + 1');

    setScore((s) => s + 1); // queued transform: +1
    appendLog('queued: s => s + 1');

    setScore((s) => s + 5); // ALSO an updater - chains off the queue instead of replacing it
    appendLog('queued: s => s + 5 (chains off the two +1 updaters above)');
  };

  return (
    <div style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
      <p>
        [Fixed] Score: <strong>{score}</strong> (render #{renderCount})
      </p>
      <button onClick={handleClick}>+1, +1, then +5 (as an updater)</button>
      <ul style={{ fontSize: '0.85rem' }}>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function QueueingStateUpdates() {
  return (
    <div>
      <h2>12. Queueing State Updates - Mixing Values and Updater Functions</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Both boxes start at score 10 and queue the same three logical steps
        per click: +1, +1, +5. Click the Broken button ONCE: the score jumps
        to 15, not 17 - the two functional +1 updates get silently discarded
        because the final <code>setScore(score + 5)</code> is a plain
        replacement value, not an updater, so it throws away everything
        queued before it and replaces the queue with "15" outright. Click
        the Fixed button: every step is an updater function, so they all
        chain correctly off each other and the score reaches 17 as expected.
      </p>

      <hr />
      <BrokenQueueDemo />

      <hr />
      <FixedQueueDemo />

      <p style={{ marginTop: '1rem', color: '#555', fontSize: '0.9rem' }}>
        See{' '}
        <a
          href="https://react.dev/learn/queueing-a-series-of-state-updates"
          target="_blank"
          rel="noreferrer"
        >
          react.dev: Queueing a Series of State Updates
        </a>{' '}
        for the full breakdown of how React processes the update queue.
      </p>
    </div>
  );
}

export default QueueingStateUpdates;
