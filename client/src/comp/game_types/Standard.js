import React from "react";

export class Standard extends React.Component {
  constructor(props) {
    super(props);
    // Expected prop socket is a socket connection directly to the server
    // Use it to communicate and update local state accordingly
  }

  render() {
    if(! this.props.in_game){
      return (
          // Something that conveys that the user is not currently part of the game
          <div>
            <h1>YOU ARE NOT PART OF THE GAME</h1>
          </div>
      )
    }
  }
}