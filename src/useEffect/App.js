import React, { Component } from 'react';
import Header from './Header/Header';

class App extends Component {
  state = {
    showHeader: true,
    headerText: 'Hello, today is: ' + new Date().toString()
  }

  render() {
    return (
      <div>
        <button onClick={() => {
          this.setState({ headerText: 'Hello, today is: ' + new Date().toString() })
        }}>Change Header Text</button>

        <button onClick={() => {
          this.setState({ showHeader: !this.state.showHeader })
        }}>Toggle Header</button>

        {this.state.showHeader && <Header headerText={this.state.headerText}></Header>}
      </div>
    )
  }
}

export default App;
