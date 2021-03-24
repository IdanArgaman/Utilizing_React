import React, { Component, Fragment } from 'react';
import UseEffectExampleApp from './useEffect/App';
import ExampleOfHoc from './hoc/App'
class App extends Component {
  render() {
    return (
      <Fragment>
        <UseEffectExampleApp />
        <ExampleOfHoc />
      </Fragment>
    )
  }
}

export default App;
