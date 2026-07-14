import React, { Component } from "react";
import "./App.css";
import traceLifecycle from "./hoc/tracer";
import TraceLogger from "./components/TraceLogger";
import TracerProvider from "./store/TracerStore";

class App extends Component {
  render() {
    return (
      <TracerProvider>
        <div className="App">
          <TraceLogger></TraceLogger>
        </div>
      </TracerProvider>
    );
  }
}

export default traceLifecycle(App);
