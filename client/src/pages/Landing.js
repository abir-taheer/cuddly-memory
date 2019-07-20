import React from 'react';
import {NavBar} from "../comp/NavBar";
import {AppContext} from "../comp/AppProvider";

export class Landing extends React.Component {
    render () {
        return (
            <div>
                <NavBar/>
                <AppContext.Consumer>
                  {(context) => <h1>Hello { context.state.name } </h1>}
                </AppContext.Consumer>
            </div>
        )
    }
}