import React, { useState, useRef, memo } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #10: The Custom Equality Comparator (arePropsEqual)
// ============================================================================
//
// THE SCENARIO: Sometimes you cannot control the reference stability of a
// prop - it might come from a parent you don't own, or from a third-party
// library that recreates objects on every call. React.memo's DEFAULT
// shallow comparison (`prevProps.user === nextProps.user`) will then always
// see a "changed" prop and re-render, even if the object's actual VALUES
// are identical.
//
// THE FIX: React.memo accepts a second argument - a custom comparison
// function `(prevProps, nextProps) => boolean`. This inverts the usual
// mental model:
//   - Return TRUE  if props are "equal enough" -> SKIP the re-render.
//   - Return FALSE if props differ            -> DO re-render.
// (This is the opposite polarity of shouldComponentUpdate, which returns
// true to ALLOW a re-render - a classic gotcha in itself!)
//
// THE WARNING: it's tempting to reach for a deep-equality library (like
// lodash.isEqual) inside this comparator to "just handle any shape of
// object." DON'T, for nested/large structures - walking an entire object
// tree on every single render to decide whether to skip a render can
// easily cost MORE than just letting React's lightweight virtual-DOM diff
// run normally. The comparator itself runs on every render regardless of
// its result, so it needs to be cheap. Prefer comparing a handful of
// specific PRIMITIVE fields (id, updatedAt, name, role, ...) that you know
// actually determine what the component renders.

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ----------------------------------------------------------------------------
// BROKEN: default shallow comparison on a prop object that's rebuilt often.
// ----------------------------------------------------------------------------
const BrokenUserCard = memo(({ user }) => {
  const renderCount = useRenderCount();
  return (
    <div style={{ border: '1px solid #c0392b', padding: '0.5rem' }}>
      [Broken] UserCard rendered {renderCount} time(s) - {user.name} ({user.role})
    </div>
  );
});

// ----------------------------------------------------------------------------
// FIXED: custom comparator checks specific primitive fields only.
// ----------------------------------------------------------------------------
const FixedUserCard = memo(
  ({ user }) => {
    const renderCount = useRenderCount();
    return (
      <div style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
        [Fixed] UserCard rendered {renderCount} time(s) - {user.name} ({user.role})
      </div>
    );
  },
  // Custom comparison function - second argument to memo().
  (prevProps, nextProps) => {
    // Return true if passing these props should NOT trigger a re-render.
    // Return false if props have meaningfully changed and we MUST re-render.
    // Only three cheap primitive comparisons - no recursion, no library.
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.role === nextProps.user.role
    );
  }
);

function CustomComparatorDemo() {
  const [tick, setTick] = useState(0);
  const [name, setName] = useState('Idan');

  // Simulates "a parent/library you don't control" handing down a BRAND NEW
  // object reference every render, even though the actual field values are
  // frequently unchanged (e.g. only `tick`, an unrelated value, changed).
  const user = { id: 1, name, role: 'admin' };

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>
        Force parent re-render (unrelated tick: {tick})
      </button>
      <br />
      <label>
        Name:{' '}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div style={{ marginTop: '0.5rem' }}>
        <BrokenUserCard user={user} />
        <FixedUserCard user={user} />
      </div>
    </div>
  );
}

function CustomComparator() {
  return (
    <div>
      <h2>10. Custom Equality Comparator (arePropsEqual)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Click "Force parent re-render" a few times: the Broken card's count
        climbs every click even though <code>user</code>'s actual field
        values never changed. The Fixed card's count stays put. Then edit
        the Name field: BOTH cards re-render, because <code>name</code> is
        one of the fields the custom comparator actually checks.
      </p>

      <hr />
      <CustomComparatorDemo />

      <p style={{ marginTop: '1rem', color: '#c0392b' }}>
        Warning: don't reach for a deep-equality library (e.g.
        lodash.isEqual) inside a comparator like this for large/nested
        objects. The comparator runs on EVERY render regardless of its
        outcome, so a heavy recursive check can cost more CPU time than the
        re-render it was meant to prevent. Compare a few specific primitive
        fields (id, updatedAt, name, role, ...) instead.
      </p>
    </div>
  );
}

export default CustomComparator;
