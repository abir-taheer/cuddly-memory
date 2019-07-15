import React from 'react';
import {NavBar} from "../comp/NavBar";

export class Landing extends React.Component {
    render () {
        return (
            <div>
                <NavBar/>
                <h1>Welcome to the app</h1>
            </div>
        )
    }
}