import React from 'react';
import socketIOClient from "socket.io-client";

import {NavBar} from "../comp/NavBar";

const queryString = require('query-string');

export class MyGames extends React.Component {
  constructor(props) {
    super(props);
    // Games have join codes that can be turned on and off to facilitate people joining the game
    // Games also have unique IDs that is passed in the url when someone is playing a game.

    this.state = {
      current_games: {

      },
      fetched_latest: false
    };

    fetch("/api/user/games")
        .then(res => res.json())
        .then(data => {
          console.log(data);
        });
  }

  render() {
    // If they requested a certain game id, check if they are in that game
    // Else show a list of the current games that they are in,
    // The option to start a game
    // The option to join a game
    // Work on adding an option to play with strangers later

    // This page should only list the current games that the user is in based on their session data
    // And past games if the user is signed in
    return (
        <div>
          <NavBar/>
          <h1>hi</h1>
        </div>
    );
  }

}