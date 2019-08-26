import React from 'react';

import {NavBar} from "../comp/NavBar";

import {Card, CardActions} from '@rmwc/card';
import '@material/card/dist/mdc.card.css';

import {Button} from "@rmwc/button";
import '@material/button/dist/mdc.button.css';

import {AppContext} from "../comp/AppProvider";

import {TextField} from "@rmwc/textfield";
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';

import {Select} from "@rmwc/select";
import '@material/select/dist/mdc.select.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/list/dist/mdc.list.css';
import '@material/menu/dist/mdc.menu.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';

import {Checkbox} from "@rmwc/checkbox";
import '@material/checkbox/dist/mdc.checkbox.css';
import '@material/form-field/dist/mdc.form-field.css';

import {Spacer} from "../comp/Spacer";


export class CreateGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        player_name: "",
        game_name: "",
        game_type: "Standard",
        make_haiku: false,
        points_redraw: false,
        rando_cardrissian: false,
        timeout: 90,
        chat: true
      }
    };

    this.updateForm = (ev) => {
      let target = ev.target;
      this.setState((state) => {
        state.form[target.name] = target.value;
        return state;
      });
    };

    this.updateCheckbox = (ev) => {
      let target = ev.target;
      this.setState((state) => {
        state.form[target.name] = target.checked;
        return state;
      });
    };

    this.submitForm = () => {
      fetch("/api/game/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.form),
      }).then((res) => res.json()).then(res => {console.log(res)});
    }
  }

  componentDidMount() {
    if( this.context.state.signed_in ){
      this.setState((state) => {
        state.form.player_name = this.context.state.name.substring(0, 24);
        return state;
      });
    }
  }

  render() {
    return (
        <div>
          <NavBar/>
          <Spacer height={"20px"}/>
          <div className={"flex-center"}>
            <Card style={{
              padding: "0 3%",
              width: "600px"
            }}>
              <h1>Create Game:</h1>

              <TextField outlined
                         label="Your Player Name"
                         name={"player_name"}
                         value={this.state.form.player_name}
                         onChange={this.updateForm}
                         maxLength={24}
                         helpText={{
                           persistent: false,
                           children: 'This will be displayed to other players. Max 24 characters.'
                         }}
              />

              <Spacer height={"10px"}/>

              <TextField outlined
                         label="Game Name"
                         name={"game_name"}
                         value={this.state.form.game_name}
                         onChange={this.updateForm}
                         maxLength={64}
              />

              <Spacer height={"20px"}/>

              <Select label="Game Type" defaultValue="Standard" name={"game_type"} onChange={this.updateForm}>
                <option value="Standard">Standard</option>
                <option value="Democracy" disabled>Democracy</option>
                <option value="Card Elimination" disabled>Card Elimination</option>
              </Select>

              <Spacer height={"20px"}/>

              <TextField name={"timeout"} label={"Turn Timer"} type={"number"} min={15} max={180} value={this.state.form.timeout} onChange={this.updateForm}/>

              <Spacer height={"20px"}/>

              <p>Extra Settings:</p>

              <Checkbox
                  label="Chat, can be enabled/disabled at any time"
                  name={"chat"}
                  checked={this.state.form.chat}
                  onChange={this.updateCheckbox}
              />

              <Checkbox
                  label="Make a haiku at the end of the game"
                  name={"make_haiku"}
                  checked={this.state.form.make_haiku}
                  onChange={this.updateCheckbox}
              />

              <Checkbox
                  label="Allow swapping white cards using points"
                  name={"points_redraw"}
                  checked={this.state.form.points_redraw}
                  onChange={this.updateCheckbox}
              />

              <Checkbox
                  label="Rando Cardrissian extra player, plays next white cards in deck"
                  name={"rando_cardrissian"}
                  checked={this.state.form.rando_cardrissian}
                  onChange={this.updateCheckbox}
              />

              <div>
                <Button raised onClick={this.submitForm}>
                  Create
                </Button>
              </div>
              <Spacer height={"20px"}/>
            </Card>
          </div>
        </div>
    )
  }
}
CreateGame.contextType = AppContext;