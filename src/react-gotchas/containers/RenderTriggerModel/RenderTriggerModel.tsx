import React, { useState, useContext, useRef, useMemo, createContext, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #15: How React Actually Decides What Re-renders
// ============================================================================
//
// THE MENTAL MODEL: "setState re-renders every component that reads that
// state" is close, but not what React does mechanically. React does not
// maintain a list of "who reads this value" for local state. Calling a
// setter just flags the FIBER (the component instance) that owns the state
// as dirty. React then re-renders that fiber and, BY DEFAULT, every child
// underneath it - whether or not that child actually reads the changed
// value. There is no dependency tracking for local state at all.
//
// React only tracks *subscribers* in two cases:
//   1. Context - a Provider fiber keeps a list of every component that
//      called useContext(ThisContext). When the value changes, React walks
//      that list directly and can re-render a deep consumer even if a
//      memoized component sits between the Provider and the consumer.
//   2. External stores (useSyncExternalStore, and libraries like Redux/
//      Zustand built on it) - the STORE keeps its own subscriber list
//      outside of React and calls back into React only for the components
//      that actually subscribed.
//
// This example puts all three side by side with render counters so the
// difference is visible instead of theoretical:
//   A) Local useState - a click re-renders the parent AND every child,
//      including a child that reads nothing from that state.
//   B) Context - only components that call useContext(...) re-render, even
//      through a React.memo boundary that would normally block a prop-based
//      re-render.
//   C) useSyncExternalStore - a plain external store (no React state at
//      all) that only notifies the components subscribed to it.
//
// For a no-code, diagram-first walkthrough of HOW useContext registers a
// caller as a subscriber without ever taking "who's calling" as a parameter
// (the ambient "currently rendering fiber" pointer), see ./MECHANICS.md.

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ----------------------------------------------------------------------------
// A) LOCAL STATE: React.memo does NOT save you from a parent re-render.
// ----------------------------------------------------------------------------
// `ChildThatReadsNothing` takes no props tied to `count` and is wrapped in
// React.memo, so it should, in theory, never re-render when `count` changes.
// But it renders anyway - `count` is local to LocalStateDemo, so React has
// no way to know this specific child doesn't care about it. All React knows
// is "LocalStateDemo is dirty, so re-run LocalStateDemo and its subtree."
const ChildThatReadsNothing = React.memo(function ChildThatReadsNothing() {
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #c0392b', padding: '0.5rem' }}>
      [Local state] ChildThatReadsNothing (React.memo) rendered {renderCount} time(s) -
      it never reads <code>count</code>.
    </p>
  );
});

function LocalStateDemo() {
  const [count, setCount] = useState(0);
  const renderCount = useRenderCount();

  return (
    <div>
      <p>
        [Local state] LocalStateDemo rendered {renderCount} time(s) - count: {count}
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Increment count</button>
      {/* No props are passed down - the child re-renders purely because it
          is a descendant of the fiber React marked dirty. */}
      <ChildThatReadsNothing />
    </div>
  );
}

// ----------------------------------------------------------------------------
// B) CONTEXT: React tracks subscribers and can skip past React.memo.
// ----------------------------------------------------------------------------
const CountContext = createContext<{ count: number; increment: () => void } | null>(null);

// This wrapper is memoized too, exactly like ChildThatReadsNothing above -
// but its CHILD reads the context directly, so memoizing the wrapper can't
// stop the consumer from updating. Context updates bypass memo boundaries
// entirely because React re-renders the *subscriber*, not the tree from the
// Provider down.
const MemoizedWrapper = React.memo(function MemoizedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const renderCount = useRenderCount();
  return (
    <div style={{ border: '1px dashed #7f8c8d', padding: '0.5rem' }}>
      <p>[Context] MemoizedWrapper (React.memo) rendered {renderCount} time(s).</p>
      {children}
    </div>
  );
});

function ContextConsumer() {
  const ctx = useContext(CountContext)!;
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
      [Context] ContextConsumer rendered {renderCount} time(s) - count: {ctx.count}
    </p>
  );
}

function ContextDemo() {
  const [count, setCount] = useState(0);
  // Memoized so the value's identity only changes when `count` changes -
  // otherwise every ContextDemo render would create a new object and defeat
  // the point of this comparison.
  const value = useMemo(() => ({ count, increment: () => setCount((c) => c + 1) }), [count]);

  return (
    <CountContext.Provider value={value}>
      <button onClick={value.increment}>Increment count</button>
      <MemoizedWrapper>
        <ContextConsumer />
      </MemoizedWrapper>
    </CountContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// C) EXTERNAL STORE: subscription list lives OUTSIDE React entirely.
// ----------------------------------------------------------------------------
// This is a minimal hand-rolled version of what Redux/Zustand do under the
// hood: a plain object holding state plus a Set of listener callbacks. React
// itself has zero knowledge of this state - useSyncExternalStore just asks
// the store "what's the current value?" and "call me back when it changes."
function createCountStore(initial: number) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    increment() {
      state += 1;
      // The store - not React - decides who gets notified. Only components
      // that called subscribe() (via useSyncExternalStore) hear about this.
      listeners.forEach((listener) => listener());
    },
  };
}

const countStore = createCountStore(0);

function StoreSubscriber() {
  const count = useSyncExternalStore(countStore.subscribe, countStore.getSnapshot);
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
      [External store] StoreSubscriber rendered {renderCount} time(s) - count: {count}
    </p>
  );
}

// This sibling never calls useSyncExternalStore, so the store notifying its
// listeners has no way to reach it - it only re-renders if ITS OWN parent
// (StoreDemo) re-renders for some unrelated reason.
function StoreBystander() {
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #7f8c8d', padding: '0.5rem' }}>
      [External store] StoreBystander rendered {renderCount} time(s) - never subscribed.
    </p>
  );
}

function StoreDemo() {
  return (
    <div>
      <button onClick={() => countStore.increment()}>Increment count</button>
      <StoreSubscriber />
      <StoreBystander />
    </div>
  );
}

// ----------------------------------------------------------------------------
function RenderTriggerModel() {
  return (
    <div>
      <h2>15. How React Actually Decides What Re-renders</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        "setState re-renders everything that reads that state" is a useful
        approximation, but React doesn't track readers for local state at
        all - it tracks the <em>fiber</em>, and by default re-renders that
        fiber's whole subtree. Context and external stores are the two
        exceptions where React (or a store outside React) keeps a real
        subscriber list. Click each button below and compare render counts.
      </p>

      <hr />
      <h3>A) Local useState - no subscriber tracking</h3>
      <LocalStateDemo />
      <p style={{ color: '#c0392b' }}>
        Every click bumps <code>ChildThatReadsNothing</code>'s count too,
        even though it's wrapped in <code>React.memo</code> and never reads{' '}
        <code>count</code>. Memo only blocks a re-render triggered by
        unchanged <em>props</em> - it does nothing against "my parent's fiber
        was marked dirty."
      </p>

      <hr />
      <h3>B) Context - React tracks subscribers directly</h3>
      <ContextDemo />
      <p style={{ color: '#27ae60' }}>
        <code>MemoizedWrapper</code>'s count barely moves (its props never
        change), but <code>ContextConsumer</code> inside it still updates
        every click. React walks the Provider's subscriber list and
        re-renders the consumer directly, skipping past the memo boundary
        entirely. For how that subscriber list gets built without ever
        passing "who's calling" as a parameter, see{' '}
        <code>MECHANICS.md</code> next to this file.
      </p>

      <hr />
      <h3>C) useSyncExternalStore - subscriber list lives outside React</h3>
      <StoreDemo />
      <p style={{ color: '#27ae60' }}>
        <code>StoreSubscriber</code> updates on every click because it called{' '}
        <code>store.subscribe</code>. <code>StoreBystander</code> never
        subscribed, so the store has no way to reach it - its count stays
        flat. React itself holds no state here at all; the store owns it and
        decides who to notify.
      </p>
    </div>
  );
}

export default RenderTriggerModel;
