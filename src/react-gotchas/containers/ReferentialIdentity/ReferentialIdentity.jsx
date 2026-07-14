import React, { useState, useRef, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #4: Referential Identity & Re-renders (the Object/Function Trap)
// ============================================================================
//
// THE SCENARIO: We wrap a child in React.memo to avoid re-rendering it
// unnecessarily, expecting it to only re-render when its own props actually
// change.
//
// WHY React.memo GETS BYPASSED:
// - React.memo does a SHALLOW comparison of props between renders (Object.is
//   on each prop, roughly `===`).
// - Every time Parent re-renders (e.g. because the user typed in an input),
//   any function or object declared directly in Parent's body is recreated
//   from scratch as a brand new reference.
// - `{} !== {}` and `(() => {}) !== (() => {})` in JavaScript, even if the
//   contents/behavior are identical. Two different objects/functions that
//   look the same are still different values in memory.
// - So `onSubmit` and `config` are technically "different props" on every
//   render, even though logically nothing about them changed. React.memo's
//   shallow check sees new references and re-renders the child anyway,
//   making the memoization pointless.
//
// THE FIX: useCallback and useMemo let us keep the SAME reference across
// renders unless something in their dependency array actually changed.

// A render counter ref so we can prove on-screen how many times each child
// actually re-rendered, without relying on the browser console.
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ----------------------------------------------------------------------------
// BROKEN VERSION
// ----------------------------------------------------------------------------
const BrokenExpensiveChild = memo(({ onSubmit, config }) => {
  const renderCount = useRenderCount();
  return (
    <div style={{ padding: '0.5rem', border: '1px solid #c0392b' }}>
      <p>BrokenExpensiveChild rendered {renderCount} time(s)</p>
      <button onClick={onSubmit}>Submit (theme: {config.theme})</button>
    </div>
  );
});

function BrokenParent() {
  const [text, setText] = useState('');

  // Redeclared as a brand-new function reference on every Parent render.
  const handleSubmit = () => {
    console.log('Submitted:', text);
  };

  // Redeclared as a brand-new object reference on every Parent render.
  const configObject = { theme: 'dark' };

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here to trigger Parent re-renders"
      />
      <BrokenExpensiveChild onSubmit={handleSubmit} config={configObject} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIXED VERSION
// ----------------------------------------------------------------------------
const FixedExpensiveChild = memo(({ onSubmit, config }) => {
  const renderCount = useRenderCount();
  return (
    <div style={{ padding: '0.5rem', border: '1px solid #27ae60' }}>
      <p>FixedExpensiveChild rendered {renderCount} time(s)</p>
      <button onClick={onSubmit}>Submit (theme: {config.theme})</button>
    </div>
  );
});

function FixedParent() {
  const [text, setText] = useState('');

  // useCallback memoizes the FUNCTION REFERENCE itself. React only creates a
  // new function when something in the dependency array ([text]) changes;
  // otherwise it hands back the exact same reference as last render.
  const handleSubmit = useCallback(() => {
    console.log('Submitted:', text);
  }, [text]); // Intentionally depends on `text` since the callback reads it

  // useMemo memoizes the RESULT of the function (the object itself), not the
  // function. With an empty dependency array, the same object reference is
  // reused for the entire lifetime of this component.
  const configObject = useMemo(() => ({ theme: 'dark' }), []);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here - child below should NOT re-render"
      />
      <FixedExpensiveChild onSubmit={handleSubmit} config={configObject} />
    </div>
  );
}

function ReferentialIdentity() {
  return (
    <div>
      <h2>4. Referential Identity &amp; Re-renders (memo trap)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>

      <hr />
      <h3>Broken (new function/object every render defeats React.memo)</h3>
      <BrokenParent />
      <p style={{ color: '#c0392b' }}>
        Type in the input above: the render count keeps climbing on every
        keystroke, even though "onSubmit" and "config" never meaningfully
        changed.
      </p>

      <hr />
      <h3>Fixed (useCallback + useMemo preserve references)</h3>
      <FixedParent />
      <p style={{ color: '#27ae60' }}>
        Type in the input above: the render count stays at 1 - React.memo
        correctly skips re-rendering the child since its props are
        referentially stable.
      </p>
    </div>
  );
}

export default ReferentialIdentity;
