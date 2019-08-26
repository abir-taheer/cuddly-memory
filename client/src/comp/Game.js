import React from 'react';
import socketIOClient from "socket.io-client";

export class Game extends React.Component {
  constructor(props) {
    super(props);
    this.socket = socketIOClient("/", {transports: ['websocket'], upgrade: false});
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
    props.socket.emit("");
    setTimeout(() => {
      props.socket.disconnect();
    }, 5000);
  }

  render() {
    return (
        <div></div>
    )
  }

}
