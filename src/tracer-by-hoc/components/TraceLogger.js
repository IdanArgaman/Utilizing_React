import React, { Component } from "react";
import { connect } from 'react-redux';
import { TracerContext } from "../store/TracerStore";

class TraceLogger extends Component {
  render() {
    return <div className="TraceLogger">
        {JSON.stringify(this.props.logEntries)}
    </div>;
  }
}

const mapStateToProps = ({logEntries}) => ({
    logEntries
});
  

export default connect(mapStateToProps, null, null, {context: TracerContext})(TraceLogger);
