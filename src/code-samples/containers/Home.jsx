import React from 'react';
import { Link } from 'react-router-dom';
import { samples } from '../App';

// Landing page for the code-samples app: lists every sample as a clickable
// link, generated from the shared `samples` array so it can't drift out of
// sync with the actual routes.
function Home() {
  return (
    <div>
      <p>
        Practical, reusable component patterns - as opposed to{' '}
        <Link to="/react-gotchas">React Gotchas</Link>, which focuses on
        broken-vs-fixed bug demos, these are self-contained building blocks
        you could drop into a real app.
      </p>
      <ul style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
        {samples.map(({ path, label }) => (
          <li key={path} style={{ margin: '0.5rem 0' }}>
            <Link to={path}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
