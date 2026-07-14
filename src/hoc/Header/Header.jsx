import React from 'react'
import withClass from '../hoc/withClass';

const style = {
    padding: '16px',
    textAlign: 'center',
    margin: '16px',
    border: '1px solid black',
    fontSize: '14px'
};

const Header = (props) => {
    return (
        <div style={style}>{props.headerText}</div>
    );
}

export default withClass(Header, 'temp');

