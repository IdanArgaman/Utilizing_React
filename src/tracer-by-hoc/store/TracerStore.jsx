import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { reducer } from './reducer';

// Context for the tracer store
export const TracerContext = React.createContext();

export const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

const TracerProvider = ({children}) => (
  <Provider store={store} context={TracerContext}>{children}</Provider>
);

TracerProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default TracerProvider;
