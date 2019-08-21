import React from "react";
import socketIOClient from "socket.io-client";

import {NavBar} from "../comp/NavBar";
import {Queue} from "../comp/Queue";

const queryString = require('query-string');

export class Play extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joined: false,
      in_game: false
    };
    this.query = queryString.parse(this.props.location.search);
  }


  componentDidMount() {

    if(typeof this.query.game !== 'undefined'){
      const socket = socketIOClient("/", {transports: ['websocket'], upgrade: false});
      socket.emit("join", this.query.game);
    }

  }

  render() {
    return (
        <div>
          <NavBar/>
          <h1>Trying to join game {this.query.game}</h1>
        </div>
    )
  }
}