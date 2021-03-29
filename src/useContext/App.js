import React, { useState } from "react";
import ThemeContext from "./context/ThemeContext";
import Header from "./components/Header";
import Main from "./components/MainWithClass";
import MainWithFunc from "./components/MainAsFunc";
import MainWtihClassSecond from "./components/MainWithClassSecond";

function App() {
  // Remember that the return from useState is an array with the first element
  // as the data and the second one is an updater function
  const themeHook = useState("light");

  return (
    // We equip the provider with the hook!
    //
    <ThemeContext.Provider value={themeHook}>
      <div className="App">
        <Header />
        <div>
          <Main />
          <MainWtihClassSecond />
          <MainWithFunc />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
