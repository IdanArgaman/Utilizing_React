import React from 'react'
import Footer from './components/Footer'
import AddTodo from './containers/AddTodo'
import VisibleTodoList from './containers/VisibleTodoList'

import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers'

const store = createStore(rootReducer)

const App = () => (
  <div className="App">
    <Provider store={store}>
      <AddTodo />
      <VisibleTodoList />
      <Footer />
    </Provider>
  </div>
)

export default App
