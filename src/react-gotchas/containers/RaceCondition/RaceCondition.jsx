import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #3: Fetch Race Conditions in useEffect
// ============================================================================
//
// THE SCENARIO: A dropdown selects a user ID, which triggers a fetch for that
// user's profile.
//
// THE BUG: If you switch quickly between User A -> User B -> User C:
//   1. Request for A starts.
//   2. Request for B starts.
//   3. Request for C starts.
//   4. Request C finishes FIRST (maybe A's request is just slow/unlucky)
//      and sets state to User C.
//   5. Request A finally finishes and OVERWRITES the state with User A's
//      data - even though the dropdown (via props/selectedId) clearly shows
//      "C" is selected.
//   RESULT: The UI says "User C" is selected, but displays User A's data.
//
// We don't have a real backend here, so `fakeFetchUser` simulates the network
// by resolving after a RANDOM delay - this makes the race condition easy to
// reproduce: just click between users quickly and you'll eventually see a
// mismatch between the selected id and the displayed name.

function fakeFetchUser(userId) {
  const randomDelayMs = 300 + Math.random() * 1500; // 300ms - 1800ms, simulates flaky network
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, name: `User #${userId}`, fetchedAfterMs: Math.round(randomDelayMs) });
    }, randomDelayMs);
  });
}

// ----------------------------------------------------------------------------
// BROKEN VERSION: no guard against out-of-order responses.
// ----------------------------------------------------------------------------
function BrokenUserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(null); // show loading while the new request is in flight
    fakeFetchUser(userId).then((data) => {
      // No check here! Whichever request resolves LAST wins, regardless of
      // whether it's actually the request for the CURRENTLY selected userId.
      setUser(data);
    });
  }, [userId]);

  if (!user) return <p>Loading...</p>;
  return (
    <p>
      Showing data for: <strong>{user.name}</strong> (resolved after{' '}
      {user.fetchedAfterMs}ms) - selected id is currently <strong>{userId}</strong>
      {user.id !== userId && (
        <span style={{ color: '#c0392b' }}> -- MISMATCH! Stale response won the race.</span>
      )}
    </p>
  );
}

// ----------------------------------------------------------------------------
// FIXED VERSION: boolean "is this effect run still current?" flag.
// ----------------------------------------------------------------------------
// Every time the effect re-runs (because userId changed) OR the component
// unmounts, React calls the cleanup function FIRST, which flips `isCurrent`
// to false for that specific closure. So when a stale request's .then()
// finally fires, it checks its own `isCurrent` flag and bails out instead of
// calling setUser. The most recent effect run always has the only flag that
// is still `true`, so only the latest request is allowed to update state.
function FixedUserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isCurrent = true; // Tracks whether THIS run of the effect is still relevant
    setUser(null);

    fakeFetchUser(userId).then((data) => {
      if (isCurrent) {
        setUser(data);
      }
      // else: silently discard - a newer request has since superseded this one
    });

    return () => {
      isCurrent = false; // Invalidates this run's result if userId changes or we unmount
    };
  }, [userId]);

  if (!user) return <p>Loading...</p>;
  return (
    <p>
      Showing data for: <strong>{user.name}</strong> (resolved after{' '}
      {user.fetchedAfterMs}ms) - selected id is currently <strong>{userId}</strong>
    </p>
  );
}

// Note: the modern alternative to the boolean flag is a real AbortController,
// which actually cancels the in-flight network request instead of just
// ignoring its result:
//
// useEffect(() => {
//   const controller = new AbortController();
//   fetch(url, { signal: controller.signal }).then(...);
//   return () => controller.abort();
// }, [userId]);

function UserPicker({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value={1}>User 1</option>
      <option value={2}>User 2</option>
      <option value={3}>User 3</option>
    </select>
  );
}

function RaceCondition() {
  const [brokenId, setBrokenId] = useState(1);
  const [fixedId, setFixedId] = useState(1);

  return (
    <div>
      <h2>3. Fetch Race Conditions in useEffect</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Try switching between User 1 / 2 / 3 rapidly, several times in a row.
        The delay is randomized, so occasionally an older request resolves
        after a newer one.
      </p>

      <hr />
      <h3>Broken (no guard)</h3>
      <UserPicker value={brokenId} onChange={setBrokenId} />
      <BrokenUserProfile userId={brokenId} />

      <hr />
      <h3>Fixed (isCurrent flag ignores stale responses)</h3>
      <UserPicker value={fixedId} onChange={setFixedId} />
      <FixedUserProfile userId={fixedId} />
    </div>
  );
}

export default RaceCondition;
