import React from 'react';
import {Link} from "react-router-dom";

import {CircularProgress} from '@rmwc/circular-progress';
import '@rmwc/circular-progress/circular-progress.css';

import {Button} from "@rmwc/button";
import '@material/button/dist/mdc.button.css';

import {List, SimpleListItem} from "@rmwc/list";
import '@material/list/dist/mdc.list.css';

import {Card} from "@rmwc/card";
import '@material/card/dist/mdc.card.css';

import {NavBar} from "../comp/NavBar";
import {Spacer} from "../comp/Spacer";


export class MyGames extends React.Component {
  constructor(props) {
    super(props);
    // Games have join codes that can be turned on and off to facilitate people joining the game
    // Games also have unique IDs that is passed in the url when someone is playing a game.

    this.state = {
      current_games: {
      },
      fetched_latest: false,
      error: false
    };

    this.getGames = () => {
      this.setState({error: false});
      fetch("/api/user/games")
          .then(res => res.json())
          .then(data => {
            this.setState({
              current_games: data,
              fetched_latest: true
            });
          })
          .catch(() => {
            this.setState({error: true});
          });
    };
  }

  componentDidMount() {
    this.getGames();
  }

  render() {
    // If they requested a certain game id, check if they are in that game
    // Else show a list of the current games that they are in,
    // The option to start a game
    // The option to join a game
    // Work on adding an option to play with strangers later

    // This page should only list the current games that the user is in based on their session data
    // And past games if the user is signed in
    if(this.state.error){
      return (
          <div>
            <NavBar/>
            <h1 style={{color:"red"}}>Error Fetching Your Games</h1>
            <div className={"flex-center"}>
              <Button label="Try Again" danger outlined onClick={this.getGames}/>
            </div>
          </div>
      )
    }

    if(!this.state.fetched_latest){
      return (
          <div>
            <NavBar/>
            <Spacer height={"5em"}/>
            <CircularProgress size={"large"}/>
          </div>
      )
    }

    return (
        <div>
          <NavBar/>
          <h1>My Current Games</h1>
          <div className={"flex-center"}>
            <Card className={"medium-width"}>
              <div className={"sub-container"}>
                <GamesList games={this.state.current_games}/>
              </div>
            </Card>
          </div>
        </div>
    );
  }

}

class GamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      clicked_game: ""
    };
  }

  render() {
    let items = this.props.games.map((data, index) =>
        <Link to={"/play?game=" + data.game_id} key={index} className={["no-decoration"]}>
          <SimpleListItem
              graphic="touch_app"
              text={data.game_name}
              secondaryText={new Date(data.game_created_datetime).toDateString()}
          />
        </Link>
    );

    if(this.props.games.length === 0){
      return (
          <div>
            <p>You don't have any in-progress games</p>
          </div>
      )
    }
    return(
        <List twoLine>
          {items}
        </List>
    )
  }
}