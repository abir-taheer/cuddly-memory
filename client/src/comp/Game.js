import React from 'react';
import socketIOClient from "socket.io-client";

export class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      in_game: false,
      game_settings: {}
    };
    this.socket = socketIOClient("/", {transports: ['websocket'], upgrade: false});

    this.socket.on("join_status", joined =>{
      this.setState({in_game: joined});

      // TODO WORK ON THE SETTINGS UPDATE LATER
    });
  }

  componentDidMount() {

    if(this.props.id){
      this.socket.emit("join", this.props.id);
    }

  }

  render() {
    return (
        <div>
          <h1>You're trying to join a game {this.props.id} i see</h1>
          <Chat socket={this.socket} />
        </div>
    )
  }

}

export class Chat extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
        <div></div>
    )
  }

}
