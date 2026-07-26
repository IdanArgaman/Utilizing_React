import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWindowEvent, useDocumentEvent } from './useWindowEvent';

// ============================================================================
// GOTCHA #13: Typing Event Hooks with Correlated Generics
// ============================================================================
//
// See useWindowEvent.ts in this folder for the full explanation of the
// pattern. Short version: useWindowEvent<K extends keyof WindowEventMap>
// ties the `handler` parameter's event type to whichever event-name string K
// was actually passed, using an indexed access type (WindowEventMap[K]).
// Try changing 'mousemove' below to a typo'd string, or changing the
// handler's inferred event param to `e.notARealProperty` - both are
// compile-time errors, not just runtime bugs.
//
// This demo also doubles as a reminder of a SEPARATE, runtime gotcha: both
// hooks list `handler` as an effect dependency, so passing a fresh inline
// function on every render (as MousePositionDemo does NOT do, but
// KeydownCounterDemo intentionally DOES do) re-subscribes the listener on
// every render. Watch the render counters below to see the difference.

function MousePositionDemo() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Stabilized with useCallback: this function reference never changes, so
  // the effect inside useWindowEvent never re-subscribes after mount.
  // `e` is inferred as MouseEvent here because 'mousemove' is the K.
  const handleMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  useWindowEvent('mousemove', handleMove);

  return (
    <div>
      <p>
        Mouse position: <strong>({pos.x}, {pos.y})</strong>
      </p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Rendered {renderCount.current} time(s) - the listener was attached
        exactly once (stable handler via useCallback), even though the
        component re-renders on every mouse move.
      </p>
    </div>
  );
}

function KeydownCounterDemo() {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [pressCount, setPressCount] = useState(0);
  const subscribeCount = useRef(0);

  // Deliberately NOT stabilized - a new inline arrow function every render.
  // Because useWindowEvent's effect depends on `handler`, this means the
  // window listener is removed and re-added after every single keypress.
  // Functionally it still works (removeEventListener/addEventListener are
  // cheap and synchronous), but it's the exact re-subscribe-every-render
  // cost called out in useWindowEvent.ts's comments.
  // `e` is inferred as KeyboardEvent here because 'keydown' is the K.
  useWindowEvent('keydown', (e) => {
    subscribeCount.current += 1;
    setLastKey(e.key);
    setPressCount((c) => c + 1);
  });

  return (
    <div>
      <p>
        Press any key on the page. Last key: <strong>{lastKey ?? '(none yet)'}</strong>,
        presses: <strong>{pressCount}</strong>
      </p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Listener has been (re)subscribed <strong>{subscribeCount.current}</strong> time(s)
        so far this mount - it climbs roughly 1-for-1 with keypresses because
        `handler` is a new inline function every render.
      </p>
    </div>
  );
}

function VisibilityDemo() {
  const [visibility, setVisibility] = useState(document.visibilityState);

  // useDocumentEvent, not useWindowEvent: 'visibilitychange' fires on
  // `document`, not `window` - this is exactly why the hook file defines two
  // separate generics (WindowEventMap vs DocumentEventMap) rather than one
  // hook for both targets. Note the handler here takes no meaningful event
  // payload (Event), so there's nothing interesting to destructure - we just
  // re-read document.visibilityState directly.
  useDocumentEvent('visibilitychange', () => {
    setVisibility(document.visibilityState);
  });

  return (
    <p>
      Document visibility: <strong>{visibility}</strong> - switch browser
      tabs/minimize the window and come back to see this update.
    </p>
  );
}

function WindowEventHooks() {
  return (
    <div>
      <h2>13. Custom Hooks: Correlated Generics (useWindowEvent / useDocumentEvent)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        <code>useWindowEvent&lt;K extends keyof WindowEventMap&gt;</code> ties
        the handler's event type to whatever event name you passed, via an
        indexed access type (<code>WindowEventMap[K]</code>). See{' '}
        <code>useWindowEvent.ts</code> in this folder for the full breakdown.
      </p>

      <hr />
      <h3>useWindowEvent('mousemove', ...) - stabilized handler</h3>
      <MousePositionDemo />

      <hr />
      <h3>useWindowEvent('keydown', ...) - unstabilized handler</h3>
      <KeydownCounterDemo />

      <hr />
      <h3>useDocumentEvent('visibilitychange', ...)</h3>
      <VisibilityDemo />
    </div>
  );
}

export default WindowEventHooks;
