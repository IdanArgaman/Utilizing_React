import React from "react";
import ThemeToggler from "./ThemeToggler";

const headerStyles = {
    padding: "1rem",
}

const Header = () => {
    return(
        <header style = {headerStyles}>
            <h1>Context API</h1>
            <div style={{display:'flex', alignItems: 'center'}}>
                <span>Change Theme:</span>
                <ThemeToggler />
            </div>
           
        </header>
    );
}

export default Header;
