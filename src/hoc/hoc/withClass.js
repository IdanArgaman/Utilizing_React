import React from 'react';

// We should note how we pass props to the wrapped component.
// We should understand that the hoc takes a component & parameters and returns
// a functional component which renders the wrapped with addition of some logic (a wrapper div in our case)!
const withClass = (WrappedComponent, className) => {
    return props => (
        <div className={className}>        
            <WrappedComponent {...props}></WrappedComponent>
        </div>
    )
}

export default withClass;