import React, { Component } from "react";
import ThemeContext from "../context/ThemeContext";
import AppTheme from "../colors";
import mainStyles from "./mainStyles";

class Main extends Component {

  // This static make React exposing the context for
  // this component in its "context" property

  // 🔺 We should note that this method limits you to consuming only one context
  static contextType = ThemeContext;

  render() {
    // Here! We access index 0 because the context is a state hook
    const currentTheme = AppTheme[this.context[0]]; 
    return (
      <main
        style={{
          ...mainStyles,
          backgroundColor: `${currentTheme.backgroundColor}`,
          color: `${currentTheme.textColor}`,
        }}
      >
        <h1> Heading 1 </h1> <p> This is a paragraph </p>
        <button>Does nothing</button>
      </main>
    );
  }
}

export default Main;
