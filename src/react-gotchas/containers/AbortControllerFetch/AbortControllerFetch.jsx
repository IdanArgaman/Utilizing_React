import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #6: Resilient Fetch Race Conditions (AbortController)
// ============================================================================
//
// THE PROBLEM (recap from gotcha #3): rapidly-triggered requests can resolve
// out of order. A slow, earlier request can finish AFTER a fast, later one,
// and overwrite fresh state with stale data.
//
// THE EARLIER FIX (gotcha #3) used a boolean `isCurrent` flag: the stale
// request still runs to completion over the network, we just IGNORE its
// result once it arrives. That works, but wastes bandwidth/CPU on a
// response nobody wants.
//
// THE MODERN FIX: AbortController physically cancels the in-flight HTTP
// request at the browser/network level. When a new request starts (because
// a dependency changed) or the component unmounts, we call
// `controller.abort()`, which:
//   1. Causes the browser to actually terminate that network request.
//   2. Makes the pending `fetch(...)` promise reject with a special
//      DOMException named "AbortError".
// We catch that specific error and swallow it silently (it's expected,
// not a real failure) - any OTHER error (network failure, bad JSON, etc.)
// is still treated as a genuine error.
//
// We simulate the network with a fake fetch-like function that respects an
// AbortSignal, since we don't have a real backend in this playground.

function fakeFetchUser(userId, { signal }) {
  const randomDelayMs = 300 + Math.random() * 1500;
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve({ id: userId, name: `User #${userId}`, fetchedAfterMs: Math.round(randomDelayMs) });
    }, randomDelayMs);

    // Mimics what a real `fetch` does internally: listening for the abort
    // signal and rejecting with an AbortError if it fires before we resolve.
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      reject(abortError);
    });
  });
}

function AbortControllerUserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  const appendLog = (msg) => setLog((prev) => [...prev, msg].slice(-6));

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setUser(null);
    setError(null);

    async function fetchData() {
      try {
        const data = await fakeFetchUser(userId, { signal });
        setUser(data);
        appendLog(`Request for user ${userId} resolved successfully.`);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message); // A REAL error - not just a cancellation
        } else {
          // Expected: this request was superseded by a newer one, or the
          // component unmounted. Nothing went wrong; just don't update state.
          appendLog(`Request for user ${userId} was aborted (superseded).`);
        }
      }
    }

    fetchData();

    // Cleanup runs BEFORE the next effect (when userId changes) and on
    // unmount. This is what physically cancels the network request.
    return () => controller.abort();
  }, [userId]);

  return (
    <div>
      {error && <p style={{ color: '#c0392b' }}>Error: {error}</p>}
      {!error && !user && <p>Loading...</p>}
      {user && (
        <p>
          Showing data for: <strong>{user.name}</strong> (resolved after{' '}
          {user.fetchedAfterMs}ms)
        </p>
      )}
      <ul style={{ fontSize: '0.85rem', color: '#555' }}>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function UserPicker({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value={1}>User 1</option>
      <option value={2}>User 2</option>
      <option value={3}>User 3</option>
    </select>
  );
}

function AbortControllerFetch() {
  const [userId, setUserId] = useState(1);

  return (
    <div>
      <h2>6. Resilient Fetch Race Conditions (AbortController)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Switch users rapidly. Unlike gotcha #3's boolean-flag fix, this
        version actually cancels the outdated network request via
        AbortController instead of just ignoring its result - watch the log
        for "aborted" entries as you switch quickly.
      </p>

      <hr />
      <UserPicker value={userId} onChange={setUserId} />
      <AbortControllerUserProfile userId={userId} />
    </div>
  );
}

export default AbortControllerFetch;
