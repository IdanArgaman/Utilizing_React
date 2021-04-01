import React, { Component } from "react";
import classes from "./App.module.css";
import Dummy from "./components/Dummy/Dummy"

class App extends Component {
  render() {
    return (
      <div className={classes.App + " xxx"}>
        <Dummy />
      </div>
    );
  }
}

export default App;
