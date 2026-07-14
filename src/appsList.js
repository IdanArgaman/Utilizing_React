import UseEffectExampleApp from './useEffect/App';
import ExampleOfHoc from './hoc/App';
import UseContextApp from './useContext/App';
import TracerApp from './tracer-by-hoc/App';
import ErrorHandlingApp from './error-handling-hoc/App';
import TodosReduxApp from './todos-redux-example/App';
import RouterApp from './react-router/App';
import ReactGotchasApp from './react-gotchas/App';

// Single source of truth for every example "mini app" in this repo.
// Both the Home page's link list (src/containers/Home.jsx) and the <Route>
// table (src/App.jsx) are generated from this array, so adding a new example
// app only ever requires one new entry here.
export const apps = [
  {
    path: '/use-effect',
    label: 'useEffect: Header Toggle',
    description:
      'A minimal useEffect example - toggling and updating a Header component to see when effects re-run.',
    component: UseEffectExampleApp,
  },
  {
    path: '/hoc',
    label: 'Higher-Order Components (HOC)',
    description:
      'Wraps a Header component with a HOC that injects extra markup/props, without modifying Header directly.',
    component: ExampleOfHoc,
  },
  {
    path: '/use-context',
    label: 'useContext: Theme Toggler',
    description:
      'Shares a light/dark theme value across class and function components via React Context, avoiding prop drilling.',
    component: UseContextApp,
  },
  {
    path: '/tracer-by-hoc',
    label: 'Lifecycle Tracer HOC',
    description:
      'A HOC that logs component lifecycle events (mount/update) for whatever component it wraps - useful for debugging re-renders.',
    component: TracerApp,
  },
  {
    path: '/error-handling-hoc',
    label: 'Error Handling HOC (Axios)',
    description:
      'A HOC that wraps a component with shared Axios error-handling logic (a loading backdrop + modal on failed requests).',
    component: ErrorHandlingApp,
  },
  {
    path: '/todos-redux',
    label: 'Todos (Redux)',
    description:
      'A classic todo list wired up with Redux: actions, reducers, and connected containers for adding/filtering todos.',
    component: TodosReduxApp,
  },
  {
    path: '/react-router',
    label: 'React Router Basics',
    description:
      'Courses/Users pages, nested routes, route params vs. query params, redirects, and a catch-all 404 route (react-router-dom v5).',
    component: RouterApp,
  },
  {
    path: '/react-gotchas',
    label: 'React Gotchas: Interview Prep',
    description:
      'Four classic React interview gotchas with broken vs. fixed code side by side: stale closures, batching, fetch race conditions, and referential identity.',
    component: ReactGotchasApp,
  },
];
