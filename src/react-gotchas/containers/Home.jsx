import React from 'react';
import { Link } from 'react-router-dom';
import { examples } from '../App';

// Simple landing page: lists every gotcha example as a clickable link.
// Pulling from the shared `examples` array (defined in App.jsx) means this
// list can never drift out of sync with the actual routes.
function Home() {
  return (
    <div>
      <p>
        Click into each example below. Every component contains both the
        <strong> broken </strong> version (commented out or shown first) and
        the <strong> fixed </strong> version, with inline comments explaining
        the "why" behind the bug.
      </p>
      <ul style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
        {examples.map(({ path, label }) => (
          <li key={path} style={{ margin: '0.5rem 0' }}>
            <Link to={path}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
