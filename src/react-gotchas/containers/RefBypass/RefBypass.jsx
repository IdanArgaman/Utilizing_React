import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #5: Multi-Stage State Batching & useState vs. useRef
// ============================================================================
//
// THE PROBLEM: State updates are scheduled snapshots, not live variables.
// Calling setText(...) does not mutate `text` in place - it schedules a
// re-render where `text` will hold the new value NEXT time. Any function
// (like handleSave below) that already captured `text` via a closure keeps
// seeing the value `text` had AT THE TIME that closure was created, even if
// the user keeps typing while that function is still running (e.g. during
// an `await`).
//
// THE REF BYPASS: useRef gives you a mutable box (`{ current: ... }`) that
// is the SAME object across every render. Writing to `ref.current` mutates
// it immediately and synchronously - there's no re-render, no snapshot, no
// closure staleness. Reading `ref.current` later always reflects the latest
// write, no matter how much time (or how many renders) passed in between.
//
// DEMONSTRATION SCENARIO:
// 1. User types "React".
// 2. User clicks Save. `handleSave` starts, captures `text` as "React" in
//    its closure, and starts a 1-second simulated network delay.
// 3. WHILE that delay is running, the user keeps typing " Rocks" (so the
//    input now reads "React Rocks").
// 4. When the delay resolves, `text` (the closure's captured value) is
//    still "React" - stale. But `pendingTextRef.current` was updated
//    synchronously on every keystroke, so it correctly reads "React Rocks".

function RefBypassDemo() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);

  // A ref that always mirrors the latest typed value, updated synchronously
  // on every keystroke - completely independent of React's render cycle.
  const pendingTextRef = useRef('');

  const appendLog = (msg) => setLog((prev) => [...prev, msg]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setText(newVal); // Schedules a re-render (async, from React's perspective)
    pendingTextRef.current = newVal; // Mutates immediately (sync, no re-render)
  };

  const handleSave = async () => {
    setStatus('saving');
    appendLog(`Save started. Captured state "text" right now: "${text}"`);

    // Simulate a 1-second network request. While this is pending, the user
    // is free to keep typing - `text` inside this function will NOT update,
    // because this whole async function is one continuous closure that
    // captured `text` at the moment handleSave was called.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    appendLog(`After 1s delay - state "text" (stale closure): "${text}"`);
    appendLog(`After 1s delay - ref "pendingTextRef.current" (live): "${pendingTextRef.current}"`);
    setStatus('idle');
  };

  return (
    <div>
      <input
        value={text}
        onChange={handleChange}
        placeholder="Type 'React', click Save, then quickly type ' Rocks'"
        style={{ width: 320 }}
      />
      <button onClick={handleSave} disabled={status === 'saving'} style={{ marginLeft: 8 }}>
        {status === 'saving' ? 'Saving...' : 'Save'}
      </button>
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function RefBypass() {
  return (
    <div>
      <h2>5. Multi-Stage State Batching &amp; useState vs. useRef</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Type "React", click Save, then IMMEDIATELY (within 1 second) type
        " Rocks" so the input reads "React Rocks". Watch the log: the state
        snapshot stays frozen at "React" while the ref reflects the live
        value.
      </p>

      <hr />
      <RefBypassDemo />

      <p style={{ marginTop: '1rem' }}>
        <strong>Why use a ref here instead of just reading fresher state?</strong>{' '}
        Because <code>handleSave</code> is an async closure - once it starts
        running, it can't "peek" at future renders. A ref is the escape
        hatch: it lets synchronous code read a value that keeps changing
        during an asynchronous operation, without needing to re-run the
        effect or recreate the closure.
      </p>
    </div>
  );
}

export default RefBypass;
