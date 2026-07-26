import React from 'react';
// Same react-router-dom v5 API as the rest of the app: <Switch> + <Route
// component={...}>. No <BrowserRouter> here - the single top-level one in
// src/App.jsx already covers this sub-app.
import { Route, Switch, NavLink } from 'react-router-dom';

import Home from './containers/Home';
import TreeMenu from './containers/TreeMenu/TreeMenu';

// List of every code sample. Both the Home page's link list and the <Route>
// table below are generated from this single array, so adding a new sample
// later only means pushing one more entry here (same pattern as
// src/react-gotchas/App.jsx's `examples` array).
export const samples = [
  {
    path: '/code-samples/tree-menu',
    label: '1. Recursive Tree Menu (add / rename / remove / select)',
    component: TreeMenu,
  },
];

function CodeSamplesApp() {
  return (
    <div style={{ border: '2px solid #61dafb', padding: '1rem', margin: '1rem 0' }}>
      <h1>Code Samples</h1>

      <nav>
        <NavLink
          to="/code-samples"
          exact
          activeStyle={{ fontWeight: 'bold', color: '#fa923f' }}
        >
          Home
        </NavLink>
      </nav>

      <Switch>
        <Route path="/code-samples" exact component={Home} />

        {samples.map(({ path, component }) => (
          <Route key={path} path={path} component={component} />
        ))}

        <Route render={() => <h2>Code sample not found</h2>} />
      </Switch>
    </div>
  );
}

export default CodeSamplesApp;
