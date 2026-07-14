import React, { Component } from "react";
import ThemeContext from "../context/ThemeContext";
import AppTheme from "../colors";
import mainStyles from "./mainStyles";

class Main extends Component {
    constructor() {
        super();
        this.state = {
        }
    }
    render(){
               return(
                   // Using this consume method we should note that the consumer component takes 
                   // a child as a function and that function returns a React node. The current
                   // context value is passed to that function as an argument.
                    <ThemeContext.Consumer>
                   {
                     // A FUNCTION!
                    ([theme]) => {     // Also note that we destruct the context value!
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
                        )
                       
                    }
                }
            </ThemeContext.Consumer>
        );
    }
}

export default Main;
