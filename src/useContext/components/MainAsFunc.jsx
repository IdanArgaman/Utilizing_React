import React, {useContext} from "react";
import ThemeContext from "../context/ThemeContext";
import AppTheme from "../colors";
import mainStyles from "./mainStyles";

const Main = () => {
    const theme = useContext(ThemeContext)[0];         // NOTE!
    const currentTheme = AppTheme[theme];
    return(
        <main style = {{
            ...mainStyles,
            backgroundColor: `${currentTheme.backgroundColor}`,
            color: `${currentTheme.textColor}`,
        
        }}>
            <h1>Heading 1</h1>
            <p> This is a paragraph </p>
            <button>Does nothing</button>
        </main>
    );
}

export default Main;
