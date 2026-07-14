import React from 'react';
import { Link } from 'react-router-dom';
import { apps } from '../appsList';

// Top-level landing page: lists every example "mini app" in this repo as a
// link with a short description of what it demonstrates. Reads from the
// shared `apps` array (src/appsList.js) so this list and the <Route> table
// in App.jsx can never drift out of sync with each other.
function Home() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'left' }}>
      <h1>React Learning Playground</h1>
      <p>
        A collection of small, focused example apps - each one demonstrates a
        specific React concept, hook, or pattern. Click into any of them
        below.
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {apps.map(({ path, label, description }) => (
          <li
            key={path}
            style={{
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: '0.75rem 1rem',
              margin: '0.75rem 0',
            }}
          >
            <Link to={path} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {label}
            </Link>
            <p style={{ margin: '0.25rem 0 0' }}>{description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
