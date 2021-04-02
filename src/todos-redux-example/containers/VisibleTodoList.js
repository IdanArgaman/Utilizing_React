import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { VisibilityFilters } from '../actions'

/*  
    Inside node_modules/react-redux/es/components/connectAdvanced.js
    there is a call to a check function:

        var checkForUpdates = function checkForUpdates() { ...
        
    The function checks for state changes for a specific component. If the state change
    is at the interest of that specific component, a UI update for that component will 
    occur will occur.

      if (newChildProps === lastChildProps.current) { ...
      ...
      ...
      forceComponentUpdateDispatch({
        type: 'STORE_UPDATED',
          payload: {
          error: error
        }
      });
*/

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return todos
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter(t => t.completed)
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter(t => !t.completed)
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

const mapStateToProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
})

const mapDispatchToProps = dispatch => ({
  toggleTodo: id => dispatch(toggleTodo(id))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
