import { useState, useLayoutEffect, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// GOTCHA #16: Render -> Commit -> Paint -> Effects (the full timeline)
// ============================================================================
//
// THE MENTAL MODEL: "parent renders before child" is true but incomplete.
// A full update actually passes through FIVE distinct stages, and mixing
// them up is what causes real bugs (effects that seem to "run too late",
// or UI that flickers for one frame):
//
//   1. RENDER PHASE   - React calls component functions top-down (parent,
//                        then children) to compute what the UI SHOULD look
//                        like. Pure computation. The DOM is untouched.
//   2. COMMIT PHASE    - React takes the render output and mutates the
//                        real DOM to match it (create/update/remove nodes,
//                        attach refs). The DOM now reflects the new UI...
//   3. useLayoutEffect  - ...but the browser hasn't drawn it yet. React runs
//                        useLayoutEffect callbacks SYNCHRONOUSLY right here,
//                        bottom-up (children before parents), and BLOCKS
//                        painting until they finish. This is your one
//                        chance to read/write the DOM before the user sees
//                        anything - no flicker is possible here.
//   4. BROWSER PAINT    - Only now does the browser actually draw pixels to
//                        the screen. This is the moment the user sees
//                        anything change.
//   5. useEffect         - Runs AFTER paint, asynchronously, and does NOT
//                        block the browser. Perfect for things the user
//                        doesn't need to see synchronized with paint
//                        (analytics, subscriptions, fetches).
//
// Ordering within phases 1 and 3 also matters and is opposite each other:
//   - Render:          PARENT first, then CHILD      (top-down)
//   - Commit mutations: children attached before parents in the real DOM,
//                        but from a component-function point of view what
//                        matters here is...
//   - useLayoutEffect / useEffect: CHILD first, then PARENT (bottom-up) -
//     a child's effect needs the child's own DOM node to already exist,
//     and by the time a parent's effect runs, every child underneath it
//     has already finished setting itself up.
//
// This example logs every one of these moments to an ON-SCREEN timeline
// (not just the console) with a monotonic timestamp, for a Parent/Child
// tree, so the actual interleaving is visible instead of theoretical.
// Section B then shows *why* the ordering matters: writing to the DOM in
// useEffect vs. useLayoutEffect produces a visible one-frame flicker in one
// case and not the other. Section C is a no-code history note: class
// components solved this same problem years before useLayoutEffect
// existed, via componentDidMount/componentDidUpdate and a few workaround
// patterns worth recognizing if you ever read pre-Hooks React code.

// ----------------------------------------------------------------------------
// Shared timeline logger: every entry gets a high-resolution timestamp so
// the recorded order is trustworthy, not just "whatever order log lines
// happened to print in".
//
// IMPORTANT: `log` writes to a REF (mutation), not to state. TimelineChild
// and TimelineParent below call `log` directly from their render-phase
// function bodies, on purpose - that's what makes phase 1 visible on the
// timeline at all. Calling setState synchronously during render would
// trigger an immediate re-render, which would call `log` again during
// THAT render, forever ("Maximum update depth exceeded"). A ref mutation
// during render is safe (React explicitly allows it, e.g. for memoizing
// derived values) precisely because it does NOT schedule any new work.
// The buffered entries are copied into real state exactly once, from
// FullTimelineDemo's own effect below, after everything else - including
// paint - has already happened for this cycle.
// ----------------------------------------------------------------------------
type TimelineEntry = { label: string; t: number };

function useTimelineBuffer() {
  const bufferRef = useRef<TimelineEntry[]>([]);
  const [, forceFlush] = useState(0);

  // `log` and `flush` are wrapped in useCallback with empty deps so their
  // IDENTITY never changes across renders. This matters a lot here: they
  // get bundled into the `logger` object passed to TimelineChild/
  // TimelineParent, which list `logger` as a useLayoutEffect/useEffect
  // dependency. If log/flush were plain functions re-created every render,
  // `logger` would get a new identity every time `flush()` causes
  // FullTimelineDemo to re-render - which would re-run those effects,
  // which would call flush() again, forever. A stable identity here is
  // what makes those effects run exactly once per mount, as intended.
  const log = useCallback((label: string) => {
    bufferRef.current.push({ label, t: performance.now() });
  }, []);
  // Called from useLayoutEffect/useEffect (never from render) to publish
  // whatever is in the buffer so far. Safe there because effects run AFTER
  // React has already committed - scheduling a state update from an effect
  // queues a normal, one-shot follow-up render, not a synchronous re-entry
  // into the render currently in progress.
  const flush = useCallback(() => forceFlush((n) => n + 1), []);
  const reset = useCallback(() => {
    bufferRef.current = [];
    forceFlush(0);
  }, []);
  return { bufferRef, log, flush, reset };
}

// ----------------------------------------------------------------------------
// SECTION A: Full timeline for a Parent -> Child tree, remounted on demand.
// ----------------------------------------------------------------------------
type Logger = { log: (label: string) => void; flush: () => void };

// `logger` is passed down so Child can report into the SAME timeline as
// Parent without that being mistaken for the "state/props" data flow this
// gotcha is actually about - it is plumbing for the demo, not the concept
// being demonstrated.
function TimelineChild({ logger }: { logger: Logger }) {
  // RENDER PHASE (this function body running IS the render phase for Child).
  // Runs AFTER Parent's render phase call, because React renders top-down.
  // Only `log` (a ref push) is called here, never `flush` (a setState) -
  // see the note on useTimelineBuffer above for why calling flush from
  // render would infinite-loop instead of a scheduling a normal update.
  logger.log('Child: render phase (function body runs)');

  // Empty deps array: this effect runs exactly once, on mount (and its
  // cleanup once, on unmount) - not on every render. Runs during phase 3,
  // bottom-up: Child's layout effect fires BEFORE Parent's, because React
  // flushes layout effects child-first, so a parent's layout effect can
  // safely assume every child already finished any DOM measurement/
  // adjustment it needed to do. `flush` here is safe (and necessary, to
  // actually get these entries on screen) because effects always run AFTER
  // commit, never during render.
  useLayoutEffect(() => {
    logger.log('Child: useLayoutEffect (DOM committed, not yet painted)');
    logger.flush();
    return () => {
      logger.log('Child: useLayoutEffect cleanup');
      logger.flush();
    };
  }, [logger]);

  // Also once per mount/unmount. Runs during phase 5, also bottom-up, and
  // always strictly after paint - there is no synchronous path from
  // commit to here.
  useEffect(() => {
    logger.log('Child: useEffect (after paint)');
    logger.flush();
    return () => {
      logger.log('Child: useEffect cleanup');
      logger.flush();
    };
  }, [logger]);

  return <div style={{ padding: '0.25rem', border: '1px dashed #7f8c8d' }}>Child DOM node</div>;
}

function TimelineParent({ logger }: { logger: Logger }) {
  logger.log('Parent: render phase (function body runs)');

  useLayoutEffect(() => {
    // Fires AFTER Child's useLayoutEffect above - bottom-up ordering.
    logger.log('Parent: useLayoutEffect (DOM committed, not yet painted)');
    logger.flush();
    return () => {
      logger.log('Parent: useLayoutEffect cleanup');
      logger.flush();
    };
  }, [logger]);

  useEffect(() => {
    // Fires AFTER Child's useEffect above, and after the browser has
    // already painted whatever Child + Parent committed together.
    logger.log('Parent: useEffect (after paint)');
    logger.flush();
    return () => {
      logger.log('Parent: useEffect cleanup');
      logger.flush();
    };
  }, [logger]);

  return (
    <div style={{ padding: '0.5rem', border: '1px solid #61dafb' }}>
      Parent DOM node
      <TimelineChild logger={logger} />
    </div>
  );
}

function FullTimelineDemo() {
  const { bufferRef, log, flush, reset } = useTimelineBuffer();
  const logger = useMemo<Logger>(() => ({ log, flush }), [log, flush]);
  const [mounted, setMounted] = useState(false);

  const remount = () => {
    reset();
    setMounted(false);
    // Two renders on purpose: unmount (triggers cleanups on a live tree),
    // then remount on the next tick so the fresh mount's timeline is clean.
    requestAnimationFrame(() => setMounted(true));
  };

  useEffect(() => {
    if (!mounted) return;
    // requestAnimationFrame's callback runs right after the browser paints
    // the current frame - the closest observable proxy for "paint
    // happened" available from plain React/DOM APIs (there is no onPaint
    // event). By the time THIS callback fires, Parent's and Child's render,
    // commit, and useLayoutEffect have all already happened (React
    // guarantees layout effects are flushed before paint), so logging here
    // lands in exactly the right slot on the timeline, between the
    // useLayoutEffect and useEffect entries above/below it.
    const rafId = requestAnimationFrame(() => {
      log('Browser: paint happened (next animation frame fired)');
      flush();
    });
    return () => cancelAnimationFrame(rafId);
  }, [mounted, log, flush]);

  // The buffer (bufferRef.current) is the single source of truth; `flush`
  // just bumps a counter to force this component to re-render and read it
  // again - so the list below always reflects everything logged so far,
  // with no separate "displayed" copy to keep in sync.
  const entries = bufferRef.current;

  return (
    <div>
      <button onClick={remount}>{mounted ? 'Remount' : 'Mount'} the tree</button>
      <div style={{ minHeight: 60 }}>{mounted && <TimelineParent logger={logger} />}</div>

      <ol style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {entries.map((entry, i) => (
          <li key={i}>
            +{(entry.t - (entries[0]?.t ?? entry.t)).toFixed(1)}ms - {entry.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SECTION B: Why the ordering matters - visible flicker vs. no flicker.
// ----------------------------------------------------------------------------
// Both boxes below measure their own width via a ref, then resize
// themselves to a fixed value based on that measurement. The DIFFERENCE is
// WHEN they perform that DOM write:
//
//   - FlickerBox writes in useEffect: React commits the box at its natural
//     (wide) size, the BROWSER PAINTS THAT WIDE FRAME, and only afterwards
//     (post-paint) does the effect shrink it - so the user's eye catches
//     one frame of "wide" before it snaps to "narrow".
//   - NoFlickerBox writes in useLayoutEffect: the shrink happens BEFORE
//     paint, in the same synchronous block as the commit, so the browser
//     only ever paints the final, narrow size. No intermediate frame
//     exists for the user to see.
function FlickerBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    // Runs AFTER paint - the browser already drew the box at its natural
    // width once before this line ever executes.
    const timeout = setTimeout(() => {
      if (ref.current) ref.current.style.width = '80px';
    }, 0);
    return () => clearTimeout(timeout);
  }, [key]);

  return (
    <div>
      <div
        key={key}
        ref={ref}
        style={{
          width: '260px',
          background: '#c0392b',
          color: 'white',
          padding: '0.5rem',
          transition: 'none',
        }}
      >
        useEffect resize (may flicker wide -&gt; narrow)
      </div>
      <button onClick={() => setKey((k) => k + 1)}>Replay</button>
    </div>
  );
}

function NoFlickerBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    // Runs BEFORE paint, synchronously after commit - the browser has not
    // drawn the natural-width box yet, so it only ever paints this final
    // narrow width.
    ref.current.style.width = '80px';
  }, [key]);

  return (
    <div>
      <div
        key={key}
        ref={ref}
        style={{
          width: '260px',
          background: '#27ae60',
          color: 'white',
          padding: '0.5rem',
          transition: 'none',
        }}
      >
        useLayoutEffect resize (never flickers)
      </div>
      <button onClick={() => setKey((k) => k + 1)}>Replay</button>
    </div>
  );
}

// ----------------------------------------------------------------------------
function RenderCommitPaintTimeline() {
  return (
    <div>
      <h2>16. Render -&gt; Commit -&gt; Paint -&gt; Effects (the full timeline)</h2>
      <Link to="/react-gotchas">&larr; Back to list</Link>
      <p>
        "Parent renders, then child renders" only covers phase 1 of five.
        The full sequence is: <strong>render</strong> (top-down, function
        bodies run) -&gt; <strong>commit</strong> (React mutates the real
        DOM) -&gt; <strong>useLayoutEffect</strong> (bottom-up, synchronous,
        blocks paint) -&gt; <strong>browser paint</strong> (the user finally
        sees pixels) -&gt; <strong>useEffect</strong> (bottom-up,
        asynchronous, runs after paint). Click below to watch it happen with
        real timestamps.
      </p>

      <hr />
      <h3>A) The full timeline, timestamped</h3>
      <FullTimelineDemo />
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Expected order: Parent render -&gt; Child render -&gt; Child
        useLayoutEffect -&gt; Parent useLayoutEffect -&gt; browser paint
        -&gt; Child useEffect -&gt; Parent useEffect. Render is top-down;
        both effect types are bottom-up (child before parent) because a
        parent's effect can assume its children already finished setting
        themselves up.
      </p>

      <hr />
      <h3>B) Why it matters: visible flicker vs. none</h3>
      <p>
        Click "Replay" on each box and watch closely (or record your screen
        and step frame by frame) - the red box briefly shows its full width
        before snapping narrow; the green box never does.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <FlickerBox />
        <NoFlickerBox />
      </div>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Both boxes mutate the exact same DOM property, the exact same way.
        The only difference is WHICH phase does the mutation: after paint
        (useEffect) vs. before paint (useLayoutEffect). That single
        difference is the entire reason useLayoutEffect exists - it trades
        "never blocks the browser" (useEffect's advantage) for "can never
        produce a visible intermediate frame".
      </p>

      <hr />
      <div style={{ textAlign: 'left'}}>
      <h3>C) Before useLayoutEffect existed: how class components avoided this</h3>
      <p>
        <code>useLayoutEffect</code> was introduced with Hooks in React 16.8
        (early 2019). Class components had already been solving this exact
        flicker problem for years - just without a hook to name it.
      </p>
      <p>
        <strong>componentDidMount / componentDidUpdate</strong> occupy the
        same slot in the timeline that <code>useLayoutEffect</code> does
        today: React calls them synchronously right after committing DOM
        mutations, but before the browser paints. If you called{' '}
        <code>setState</code> or measured the DOM inside one of them, React
        would intercept the pipeline and run a synchronous re-render before
        ever handing control back to the browser to paint - so, just like
        Section B's green box, the user's first frame only ever showed the
        final, corrected layout.
      </p>
      <p>Three patterns filled in the gaps class lifecycles didn't fully cover:</p>
      <ul>
        <li>
          <strong>The hidden-first-render trick.</strong> Render the
          component with <code>opacity: 0</code> or{' '}
          <code>visibility: hidden</code>, measure its (already-committed,
          already-in-the-DOM) nodes inside{' '}
          <code>componentDidMount</code>, adjust position/size from those
          measurements, then flip visibility back on - all still before
          paint, so the hidden frame was never actually seen.
        </li>
        <li>
          <strong>Direct imperative DOM mutation via refs.</strong> Skip
          React's reconciliation loop entirely for the specific mutation:
          grab the raw node with a ref and set{' '}
          <code>element.style.left = ...</code> (or similar) straight in
          vanilla JS, synchronously, inside the same pre-paint lifecycle
          window.
        </li>
        <li>
          <strong>Pre-calculated constraints.</strong> The cheapest fix of
          all when available: avoid needing a post-commit measurement step
          in the first place by moving the layout logic upstream into pure
          CSS (flexbox, grid, absolute positioning) so the browser resolves
          the final layout natively, with no JavaScript-driven correction
          pass required at all.
        </li>
      </ul>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        <code>useLayoutEffect</code> didn't invent this pre-paint timing
        window - it just gave function components a direct hook into the
        same window class components already had, without needing a class,
        a hidden-render trick, or hand-written imperative DOM code for the
        common case.
      </p>
      </div>
    </div>
  );
}

export default RenderCommitPaintTimeline;
