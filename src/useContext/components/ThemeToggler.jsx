import React,{useContext} from "react";
import ThemeContext from "../context/ThemeContext";     // Note!

const themeTogglerStyle = {
    cursor: "pointer"
}
const ThemeToggler = () => {
    // Remember that the context holds a hook!
    const[themeMode, setThemeMode] = useContext(ThemeContext);

    return(
        <div style = {themeTogglerStyle} 
            // We use the hook updater function!
            // This will update the context too, so each of its consumer
            // should update!
            onClick = {() => {setThemeMode(themeMode === "light"? "dark": "light")}}>
            <span title = "switch theme">
                {themeMode === "light" ? "🌙" : "☀️"}
            </span>
        </div>
    );
}

export default ThemeToggler;
