import React, { Component } from 'react';
import classes from './Dummy.module.css';
import withErrorHandler from '../../hoc/withErrorHandler'
import axios from '../../axios-orders';

class Dummy extends Component {
    componentDidMount() {
        axios.get('').then(res => {
            console.log(res);
        });
    }

    render() {
        return (
            <div className={classes.Modal}>
                Dummy!
            </div>
        )
    }
}

export default withErrorHandler(Dummy, axios);