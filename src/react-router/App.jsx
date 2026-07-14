import React, { Component } from 'react';


import Courses from './containers/Courses/Courses';
import Users from './containers/Users/Users';

// NOTE: <BrowserRouter> now lives once at the very top of the app, in
// src/App.jsx. This component only renders <Switch>/<Route>/<NavLink>,
// which all work fine nested inside an ancestor Router - only the Router
// (the thing that owns the history object) must not be duplicated.
import { Route, NavLink, Switch, Redirect } from 'react-router-dom';

class App extends Component {

  render() {
    return (
      <div className="App">

        <header>
          <nav>
            <NavLink
              to="/react-router/courses/"
              exact
              activeClassName="my-active"
              activeStyle={{
                color: '#fa923f',
                textDecoration: 'underline'
              }}>Courses</NavLink>
            &nbsp;
            <NavLink to={{
              pathname: '/react-router/users',
            }}
              activeClassName="my-active"
              activeStyle={{
                color: '#fa923f',
                textDecoration: 'underline'
              }}>Users</NavLink>

          </nav>
        </header>

        <ol style={{ textAlign: 'left' }}>
          <li>👍 Add Routes to load "Users" and "Courses" on different pages (by entering a URL, without Links)</li>
          <li>👍 Add a simple navigation with two links - One leading to "Users", one leading to "Courses"</li>
          <li>👍 Make the courses in "Courses" clickable by adding a link and load the "Course" component in the place of "Courses" (without passing any data for now)</li>
          <li>👍 Pass the course ID to the "Course" page and output it there</li>
          <li>👍 Pass the course title to the "Course" page - pass it as a param or score bonus points by passing it as query params (you need to manually parse them though!)</li>
          <li>👍 Load the "Course" component as a nested component of "Courses"</li>
          <li>👍 Add a 404 error page and render it for any unknown routes</li>
          <li>👍 Redirect requests to /all-courses to /courses (Your "Courses" page)</li>
        </ol>

        <Switch>
          <Route path="/react-router/courses" component={Courses} />
          <Route path="/react-router/users" component={Users} />
          <Redirect from="/react-router/all-courses" to="/react-router/courses" />
          <Route render={() => <h1>Not found</h1>} />
        </Switch>
      </div>
    );
  }
}

export default App;
