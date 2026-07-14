import React from 'react';
// This project has react-router-dom v5 installed, so we use the v5 API:
// <Switch> + <Route component={...}> instead of the v6 <Routes> + <Route element={...}>.
// NOTE: The <BrowserRouter> itself now lives once at the very top of the app,
// in src/App.jsx. Nesting a second <BrowserRouter> in here would create its
// own independent history object and conflict with the top-level one, so
// this component only renders <Switch>/<Route>, relying on whichever Router
// is already provided by an ancestor.
import { Route, Switch, NavLink } from 'react-router-dom';

import Home from './containers/Home';
import StaleClosure from './containers/StaleClosure/StaleClosure';
import BatchingDemo from './containers/BatchingDemo/BatchingDemo';
import RaceCondition from './containers/RaceCondition/RaceCondition';
import ReferentialIdentity from './containers/ReferentialIdentity/ReferentialIdentity';
import RefBypass from './containers/RefBypass/RefBypass';
import AbortControllerFetch from './containers/AbortControllerFetch/AbortControllerFetch';
import UseIntervalHook from './containers/UseIntervalHook/UseIntervalHook';
import SplitContext from './containers/SplitContext/SplitContext';

// List of every "gotcha" example. Both the nav list on the Home page and the
// <Route> table below are generated from this single array, so adding a new
// example later only means pushing one more entry here.
export const examples = [
  {
    path: '/react-gotchas/stale-closure',
    label: '1. The Classic Stale Closure (Interval Trap)',
    component: StaleClosure,
  },
  {
    path: '/react-gotchas/batching',
    label: '2. Batching & the Sync State Illusion',
    component: BatchingDemo,
  },
  {
    path: '/react-gotchas/race-condition',
    label: '3. Fetch Race Conditions in useEffect',
    component: RaceCondition,
  },
  {
    path: '/react-gotchas/referential-identity',
    label: '4. Referential Identity & Re-renders (memo trap)',
    component: ReferentialIdentity,
  },
  {
    path: '/react-gotchas/ref-bypass',
    label: '5. Multi-Stage State Batching & useState vs. useRef',
    component: RefBypass,
  },
  {
    path: '/react-gotchas/abort-controller-fetch',
    label: '6. Resilient Fetch Race Conditions (AbortController)',
    component: AbortControllerFetch,
  },
  {
    path: '/react-gotchas/use-interval-hook',
    label: '7. Custom Hooks: The "Latest Ref Pattern" (useInterval)',
    component: UseIntervalHook,
  },
  {
    path: '/react-gotchas/split-context',
    label: '8. Context Bottlenecks & the Split Context Pattern',
    component: SplitContext,
  },
];

function ReactGotchasApp() {
  return (
    <div style={{ border: '2px solid #61dafb', padding: '1rem', margin: '1rem 0' }}>
      <h1>React Gotchas: Interview Prep</h1>

      <nav>
        <NavLink
          to="/react-gotchas"
          exact
          activeStyle={{ fontWeight: 'bold', color: '#fa923f' }}
        >
          Home
        </NavLink>
      </nav>

      <Switch>
        {/* Render the list/home page when the URL is exactly the base path */}
        <Route path="/react-gotchas" exact component={Home} />

        {/* Generate one Route per example from the array above */}
        {examples.map(({ path, component }) => (
          <Route key={path} path={path} component={component} />
        ))}

        {/* Fallback for any unmatched nested path */}
        <Route render={() => <h2>Gotcha not found</h2>} />
      </Switch>
    </div>
  );
}

export default ReactGotchasApp;
