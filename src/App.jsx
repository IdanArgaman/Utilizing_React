import React, { Component, Fragment } from 'react';
import UseEffectExampleApp from './useEffect/App';
import ExampleOfHoc from './hoc/App';
import UseContextApp from './useContext/App';
import TracerApp from './tracer-by-hoc/App';
import ErrorHandlingApp from './error-handling-hoc/App';
import TodosReduxApp from './todos-redux-example/App';
import RouterApp from './react-router/App';

class App extends Component {
  render() {
    return (
      <Fragment>
        <UseEffectExampleApp />
        <ExampleOfHoc />
        <UseContextApp />
        <TracerApp />
        <ErrorHandlingApp />
        <TodosReduxApp />
        <RouterApp />
      </Fragment>
    )
  }
}

export default App;
