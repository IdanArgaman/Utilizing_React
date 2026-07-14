import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

import Home from './containers/Home';
import { apps } from './appsList';

// A back-arrow icon button that links to Home ("/"). Rendered via <Route>'s
// render-prop so it receives the current `location` as a prop - that's what
// lets it decide whether it should show itself at all.
function BackButton({ location }) {
  const isHome = location.pathname === '/';
  if (isHome) {
    return null; // Nothing to go "back" to from the home page itself
  }

  return (
    <Link
      to="/"
      aria-label="Back to Home"
      title="Back to Home"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        fontSize: '1.25rem',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      &#8592; {/* Unicode left-arrow (←) - no icon library needed */}
    </Link>
  );
}

class App extends Component {
  render() {
    return (
      // The ONE and only <BrowserRouter> for the whole app. It owns the
      // single browser history object that all nested <Route>/<Link>/
      // <NavLink> components read from and push to. Every example app below
      // is now a plain component using <Switch>/<Route> internally - none of
      // them render their own <BrowserRouter> anymore, since nesting a
      // second Router would create a second, conflicting history object.
      <BrowserRouter>
        <div className="App">
          <nav style={{textAlign: 'left', padding: '0.5rem 1rem', borderBottom: '1px solid #ddd' }}>
            {/* Route with no `path` matches every URL, purely to read location */}
            <Route render={({ location }) => <BackButton location={location} />} />
          </nav>

          <Switch>
            {/* Landing page listing every example app with a description */}
            <Route path="/" exact component={Home} />

            {/* One Route per example app, generated from the shared list */}
            {apps.map(({ path, component }) => (
              <Route key={path} path={path} component={component} />
            ))}

            {/* Catch-all for unknown top-level paths */}
            <Route render={() => <h1>Not found</h1>} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
