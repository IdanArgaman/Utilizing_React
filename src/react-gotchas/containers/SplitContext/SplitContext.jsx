import React, { useState, useContext, useMemo, useRef, createContext } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #8: Context Bottlenecks & the Split Context Pattern
// ============================================================================
//
// THE PROBLEM: Every component that calls useContext(SomeContext) re-renders
// whenever the Provider's `value` prop changes - REGARDLESS of whether the
// specific piece of data that component actually reads changed. If you
// bundle unrelated pieces of state (e.g. `user` and `theme`) into ONE
// context value object, then updating the theme alone causes every
// component consuming that context - including ones that only care about
// `user` - to re-render too.
//
// THE SOLUTION: Split state into separate Context objects, one per logical
// "slice" of state, each with its own Provider. Components subscribe only
// to the specific context(s) they need, so a theme change no longer
// re-renders user-only consumers, and vice versa.

// ----------------------------------------------------------------------------
// BROKEN VERSION: one combined context for both `user` and `theme`.
// ----------------------------------------------------------------------------
const CombinedContext = createContext(null);

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function CombinedProvider({ children }) {
  const [user, setUser] = useState({ name: 'Idan' });
  const [theme, setTheme] = useState('dark');

  // Even though we use useMemo here, the memoized object still changes
  // identity whenever EITHER `user` OR `theme` changes, because both are in
  // its dependency array. There's no way to let a consumer subscribe to
  // "just user" or "just theme" from a single combined value.
  const value = useMemo(() => ({ user, setUser, theme, setTheme }), [user, theme]);

  return <CombinedContext.Provider value={value}>{children}</CombinedContext.Provider>;
}

function CombinedUserDisplay() {
  const { user } = useContext(CombinedContext);
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #c0392b', padding: '0.5rem' }}>
      [Combined] UserDisplay rendered {renderCount} time(s) - shows: {user.name}
    </p>
  );
}

function CombinedThemeToggle() {
  const { theme, setTheme } = useContext(CombinedContext);
  const renderCount = useRenderCount();
  return (
    <div style={{ border: '1px solid #c0392b', padding: '0.5rem' }}>
      <p>[Combined] ThemeToggle rendered {renderCount} time(s) - theme: {theme}</p>
      <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
        Toggle theme
      </button>
    </div>
  );
}

function CombinedDemo() {
  return (
    <CombinedProvider>
      <CombinedUserDisplay />
      <CombinedThemeToggle />
    </CombinedProvider>
  );
}

// ----------------------------------------------------------------------------
// FIXED VERSION: separate contexts for `user` and `theme`.
// ----------------------------------------------------------------------------
const UserStateContext = createContext(null);
const ThemeStateContext = createContext(null);

function SplitProvider({ children }) {
  const [user, setUser] = useState({ name: 'Idan' });
  const [theme, setTheme] = useState('dark');

  // Each value is memoized independently, keyed off only ITS OWN state.
  // Changing `theme` never changes `userValue`'s identity, and vice versa.
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeStateContext.Provider value={themeValue}>
      <UserStateContext.Provider value={userValue}>{children}</UserStateContext.Provider>
    </ThemeStateContext.Provider>
  );
}

function SplitUserDisplay() {
  // Only subscribes to UserStateContext - a ThemeStateContext update can
  // never cause this component to re-render.
  const { user } = useContext(UserStateContext);
  const renderCount = useRenderCount();
  return (
    <p style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
      [Split] UserDisplay rendered {renderCount} time(s) - shows: {user.name}
    </p>
  );
}

function SplitThemeToggle() {
  const { theme, setTheme } = useContext(ThemeStateContext);
  const renderCount = useRenderCount();
  return (
    <div style={{ border: '1px solid #27ae60', padding: '0.5rem' }}>
      <p>[Split] ThemeToggle rendered {renderCount} time(s) - theme: {theme}</p>
      <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
        Toggle theme
      </button>
    </div>
  );
}

function SplitDemo() {
  return (
    <SplitProvider>
      <SplitUserDisplay />
      <SplitThemeToggle />
    </SplitProvider>
  );
}

function SplitContext() {
  return (
    <div>
      <h2>8. Context Bottlenecks &amp; the Split Context Pattern</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        Click "Toggle theme" in each section below and compare the render
        counts on the UserDisplay component underneath it.
      </p>

      <hr />
      <h3>Broken (one combined context)</h3>
      <CombinedDemo />
      <p style={{ color: '#c0392b' }}>
        Toggling the theme also bumps UserDisplay's render count, even
        though UserDisplay only reads <code>user</code>, never{' '}
        <code>theme</code>.
      </p>

      <hr />
      <h3>Fixed (separate contexts per state slice)</h3>
      <SplitDemo />
      <p style={{ color: '#27ae60' }}>
        Toggling the theme here leaves UserDisplay's render count untouched
        - it only re-renders when <code>user</code> itself changes.
      </p>
    </div>
  );
}

export default SplitContext;
