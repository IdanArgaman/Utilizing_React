import React from "react";

// To make this context available to all our React components, we have to use a Provider!
// every context object comes with a Provider React component that allows consuming components
// to subscribe to context changes. It is the provider that allows the context to be consumed
// by other components

// We should note that context's structure resembles the result of a useState 
// hook but it is not exactly the result of a useState hook
const ThemeContext = React.createContext(["light", () => {}]);
export default ThemeContext;
