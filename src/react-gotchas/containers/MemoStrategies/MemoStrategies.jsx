import React, { useState, useMemo, useRef, memo } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #9: Referential Identity & Mutable Objects - Fixing Strategies
// ============================================================================
//
// Gotcha #4 already showed THAT inline objects/functions defeat React.memo.
// This example is about WHICH fix to reach for, depending on the nature of
// the object you're passing down:
//
//   A. STATIC / IMMUTABLE CONSTANTS -> declare OUTSIDE the component.
//      If the value never changes, it doesn't belong in the render loop at
//      all. A module-level constant is created exactly once, ever - not
//      once per render, not even once per mount. Every render of every
//      instance of the component shares the exact same reference.
//
//   B. DYNAMIC OBJECTS DERIVED FROM STATE -> useMemo.
//      If the object's contents depend on props/state that DOES change,
//      you can't hoist it outside the component. useMemo lets you control
//      exactly WHEN a new reference is minted - only when something in the
//      dependency array actually changes - instead of on every render.
//
//   C. MUTABLE VALUES THAT SHOULDN'T TRIGGER RE-RENDERS -> useRef.
//      Some data changes over time but should never itself cause a
//      re-render (e.g. last-known mouse coordinates, a WebSocket instance,
//      a timer id). useRef gives you a single stable container object whose
//      `.current` you can mutate freely - reading/writing it never
//      schedules a render, and the container reference itself never changes.

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// A "heavy" memoized child - in a real app this might be an expensive chart,
// table, or animation. We just track its render count to prove the point.
const ChartSettings = memo(({ config }) => {
  const renderCount = useRenderCount();
  return (
    <div style={{ color: config.color, border: '1px solid #ccc', padding: '0.5rem' }}>
      ChartSettings rendered {renderCount} time(s) - Active theme: {config.theme}
    </div>
  );
});

// ----------------------------------------------------------------------------
// STRATEGY A: Static/Immutable constant, declared OUTSIDE the component.
// ----------------------------------------------------------------------------
// This object is created ONCE when the module loads - not on every render,
// not even on every mount. `STATIC_CONFIG === STATIC_CONFIG` is trivially
// true forever, so React.memo's shallow comparison always short-circuits.
const STATIC_CONFIG = { theme: 'dark (static)', color: '#10b981' };

function StaticStrategyDemo() {
  const [text, setText] = useState('');

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here - ChartSettings below should never re-render"
      />
      <ChartSettings config={STATIC_CONFIG} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// STRATEGY B: useMemo, for objects whose contents depend on dynamic state.
// ----------------------------------------------------------------------------
// We can't hoist this object outside the component because `color` depends
// on `text`. But we don't want a new object EVERY keystroke either - only
// when the 5-character threshold is actually crossed. So the dependency
// array uses the derived boolean `text.length > 5`, not `text` itself:
// typing within the same "zone" (all short, or all long) never changes the
// dependency's value, so useMemo keeps returning the SAME object reference.
function MemoStrategyDemo() {
  const [text, setText] = useState('');

  const dynamicConfig = useMemo(() => {
    return {
      theme: 'dark (memoized)',
      color: text.length > 5 ? '#ef4444' : '#10b981',
    };
  }, [text.length > 5]); // Reference ONLY changes when the threshold is crossed!

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type <=5 chars, ChartSettings won't re-render until char #6"
      />
      <ChartSettings config={dynamicConfig} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// STRATEGY C: useRef, for mutable data that should NOT trigger re-renders.
// ----------------------------------------------------------------------------
// `mutablePayloadRef.current` can be reassigned as many times as we want -
// doing so never schedules a re-render (unlike setState) and the ref
// object's own identity (`mutablePayloadRef`) never changes across renders.
// This is ideal for "write often, read occasionally" data like the last
// click position, a scroll offset, or a mutable cache.
function RefStrategyDemo() {
  const [, forceRerenderTick] = useState(0); // Only used to prove the point below
  const mutablePayloadRef = useRef({ lastClickCoordinates: [0, 0] });
  const renderCount = useRenderCount();

  const handleClick = (e) => {
    // Mutating .current directly - completely silent to React. No render
    // is scheduled by this line alone.
    mutablePayloadRef.current = {
      lastClickCoordinates: [e.clientX, e.clientY],
    };
  };

  return (
    <div
      onClick={handleClick}
      style={{ border: '1px dashed #999', padding: '1rem', cursor: 'crosshair' }}
    >
      <p>Click anywhere in this box.</p>
      <p>
        Last click stored in ref:{' '}
        {mutablePayloadRef.current.lastClickCoordinates.join(', ')} (won't
        appear on screen until a render happens for some OTHER reason)
      </p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        RefStrategyDemo rendered {renderCount} time(s) - clicking the box
        alone does NOT increase this count.
      </p>
      <button onClick={() => forceRerenderTick((t) => t + 1)}>
        Force a re-render to reveal the ref's latest value
      </button>
    </div>
  );
}

function MemoStrategies() {
  return (
    <div>
      <h2>9. Referential Identity: Three Fixing Strategies</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>

      <hr />
      <h3>Strategy A: Static constant declared outside the component</h3>
      <StaticStrategyDemo />
      <p style={{ color: '#27ae60' }}>
        Type freely - the render count never moves. The config object was
        never re-created in the first place.
      </p>

      <hr />
      <h3>Strategy B: useMemo, keyed off a derived threshold</h3>
      <MemoStrategyDemo />
      <p style={{ color: '#27ae60' }}>
        Type up to 5 characters - no re-render. Type a 6th character and
        watch it re-render exactly once (color flips), then stays stable
        again as you keep typing beyond 5.
      </p>

      <hr />
      <h3>Strategy C: useRef for mutable, non-visual data</h3>
      <RefStrategyDemo />
      <p style={{ color: '#27ae60' }}>
        Clicking updates the ref instantly but silently. Only pressing the
        button (which calls setState) triggers a render that reveals the
        ref's latest value.
      </p>
    </div>
  );
}

export default MemoStrategies;
