import React, { useEffect } from 'react'

const style = {
    padding: '16px',
    textAlign: 'center',
    margin: '16px',
    border: '1px solid black',
    fontSize: '14px'
};

const Header = (props) => {

    // An empty array for the useEffect function, hint for it to run when component is mounted.
    // The cleanup function will be run with the component is unmounted.
    useEffect(() => {
        console.log('Header component 1st useEffect');
        
        // The use effect returns a clean up function,
        return () => {
            console.log('Header component 1st useEffect - cleanup');
        }
    }, []);

    // When the headerText prop gets changed, the cleanup function of the previous useEffect handler call
    // will be called (can be identified by looking at the printed 'time') BEFORE the new useEffect handler
    // gets called

    // Also I noticed that the cleanup function gets called when the object is unmounted!
    useEffect(() => {
        const time = new Date().getTime();
        console.log(`${time} Header component 2st useEffect`);
        
        // The use effect returns a clean up function,
        return () => {
            console.log(`${time} Header component 2st useEffect - cleanup`);
        }
    }, [props.headerText]);

    return (
        <div style={style}>{props.headerText}</div>
    );
}

export default Header;

