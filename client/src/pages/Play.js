import React from "react";

import {NavBar} from "./../comp/NavBar";
import {Queue} from "./../comp/Queue";
import {Game} from "./../comp/Game";

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

  render() {
    return (
        <div>
          <NavBar/>
          <Game id={this.query.game} />
        </div>
    )
  }
}