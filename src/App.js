import React, { Component, Fragment } from 'react';
import UseEffectExampleApp from './useEffect/App';
import ExampleOfHoc from './hoc/App';
import UseContextApp from './useContext/App';
import TracerApp from './tracer-by-hoc/App';
class App extends Component {
  render() {
    return (
      <Fragment>
        <UseEffectExampleApp />
        <ExampleOfHoc />
        <UseContextApp />
        <TracerApp />
      </Fragment>
    )
  }
}

export default App;
