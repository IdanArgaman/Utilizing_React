import React, { Component } from 'react';

// Although we are importing Header here, this is a hoc component 
// and not the Header component directly
import Header from './Header/Header';    

class App extends Component {
  state = {
    showHeader: true,
    headerText: 'Examine the source and look that the header is enclosed with a dive containing a "temp" class provided by HOC!'
  }

  render() {
    return (
      <div className="App">
        <Header headerText={this.state.headerText}></Header>
      </div>
    )
  }
}

export default App;
