import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Dux from './dux';

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {
        state = {
            error: null
        }

        // We use componentWillMount lifecycle to register interceptor because
        // we must register these BEFORE child components use axios to fetch data
        // since most components use componentDidMount to fetch data, this life cycle
        // event occurs before so it is the correct place for interceptor registration 
        componentWillMount() {
            this.reqInterceptor = axios.interceptors.request.use(req => {
                this.setState({ error: null });
                return req;
            });
            this.resInterceptor = axios.interceptors.response.use(res => res, error => {
                this.setState({ error: error });
            });
        }

        componentWillUnmount() {
            axios.interceptors.request.eject(this.reqInterceptor);
            axios.interceptors.response.eject(this.resInterceptor);
        }

        errorConfirmedHandler = () => {
            this.setState({ error: null });
        }

        render() {
            return (
                <Dux>
                    <Modal
                        show={this.state.error}
                        modalClosed={this.errorConfirmedHandler}>
                        {this.state.error ? this.state.error.message : null}
                    </Modal>
                    <WrappedComponent {...this.props} />
                </Dux>
            );
        }
    }
}

export default withErrorHandler;