import React from 'react';

import {NavBar} from "../comp/NavBar";

import {Card} from '@rmwc/card';
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

import {Checkbox} from "@rmwc/checkbox";
import '@material/checkbox/dist/mdc.checkbox.css';
import '@material/form-field/dist/mdc.form-field.css';

import {Spacer} from "../comp/Spacer";
import {Queue} from "../comp/Queue";

import {Icon} from "@rmwc/icon";
import '@rmwc/icon/icon.css';

import {DataTable, DataTableRow, DataTableBody, DataTableCell, DataTableHeadCell, DataTableContent, DataTableHead} from "@rmwc/data-table";
import '@rmwc/data-table/data-table.css';

import {CircularProgress} from '@rmwc/circular-progress';
import '@rmwc/circular-progress/circular-progress.css';
import {Redirect} from "react-router-dom";

export class CreateGame extends React.Component {
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      form: {
        player_name: "",
        game_name: "",
        game_type: "Standard",
        make_haiku: false,
        trade_points_redraw: false,
        rando_cardrissian: false,
        turn_timer: 90,
        chat: true,
        selected_card_packs: []
      },
      card_packs: [],
      card_packs_loaded: false,
      white_cards_selected: 0,
      black_cards_selected: 0,
      game_created: false,
      new_game_id: "",
      processing: false
    };

    this.updateForm = (ev) => {
      let target = ev.target;
      this.setState((state) => {
        state.form[target.name] = target.value;
        return state;
      });
    };

    // TODO UPDATE THIS ONCE CUSTOM CARD PACKS ARE ENABLED
    this.fetchCardPacks = () => {
      fetch("/api/card/packs/official")
          .then(res => res.json())
          .then(response => this.setState({card_packs: (response.data|| []), card_packs_loaded: response.success}));
    };

    this.updateCheckbox = (ev) => {
      let target = ev.target;
      this.setState((state) => {
        state.form[target.name] = target.checked;
        return state;
      });
    };

    this.submitForm = () => {
      this.setState({processing: true});
      fetch("/api/game/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.form),
      })
          .then((res) => res.json())
          .then(res => {
            if(res.success){
              this.setState({game_created: true, new_game_id: res.data.game_id});
            } else {
              Queue.notify({
                body: res.error,
                actions: [
                  {
                    "icon": "close"
                  }
                ]
              });
              this.setState({processing: false});
            }
          });
    };

    this.triggerCardPack = (id) =>{
      this.setState((state) => {
        let packs = state.form.selected_card_packs;
        if(packs.includes(id)){
          packs.splice(packs.indexOf(id), 1);
        } else {
          packs.push(id);
        }

        let whites = 0;
        let blacks = 0;
        for(let x = 0 ; x < state.card_packs.length ; x++){
          let cp = state.card_packs[x];
          if(packs.includes(cp.card_pack_id)){
            whites += cp.white;
            blacks += cp.black;
          }
        }
        state.form.selected_card_packs = packs;
        return {form: state.form, white_cards_selected: whites, black_cards_selected: blacks};
      });
    };

  }

  componentDidMount() {
    if( this.context.user.signed_in ){
      this.setState((state) => {
        state.form.player_name = this.context.user.name.substring(0, 24);
        return state;
      });
    }
    this.fetchCardPacks();
  }

  render(){
    if(this.state.game_created){
      return <Redirect to={"/play?game=" + encodeURIComponent(this.state.new_game_id)} />;
    }

    return (
        <div>
          <NavBar/>
          <Spacer height={"20px"}/>
          <div className={"flex-center"}>
            <Card style={{
              padding: "0 3%",
              maxWidth: "90%"
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

              <TextField name={"turn_timer"} label={"Turn Timer"} type={"number"} min={15} max={180} value={this.state.form.turn_timer} onChange={this.updateForm}/>

              <Spacer height={"20px"}/>

              <h3>Card Packs</h3>
              <DataTable
                  style={{ height: '300px' }}
                  stickyRows={1}
              >
                {this.state.card_packs_loaded ?
                    (
                        <DataTableContent>
                          <DataTableHead>
                            <DataTableRow>
                              <DataTableHeadCell alignStart>Name</DataTableHeadCell>
                              <DataTableHeadCell alignEnd>Creator</DataTableHeadCell>
                            </DataTableRow>
                          </DataTableHead>
                          <DataTableBody>
                            {
                              this.state.card_packs.map((data, i) => {
                                return (
                                    <DataTableRow key={i}
                                                  activated={this.state.form.selected_card_packs.includes(data.card_pack_id)}
                                                  onClick={() => {this.triggerCardPack(data.card_pack_id)}}>
                                      <DataTableCell>
                                        {data.card_pack_name}
                                        {
                                          data.official ? (
                                              <span>
                                                &nbsp;
                                                <Icon icon={{icon: "check_circle_outline", size:"xsmall"}}
                                                      style={{color: "green", verticalAlign: "middle"}}

                                                />
                                              </span>
                                          ) : null
                                        }
                                      </DataTableCell>
                                      <DataTableCell>{data.creator_name} {data.official && <span>&trade;</span>}</DataTableCell>
                                    </DataTableRow>
                                );
                              })
                            }
                          </DataTableBody>
                        </DataTableContent>
                    ):
                    (
                        <div>
                          <Spacer height={"120px"}/>
                          <div className={["flex-center"]} >
                            <CircularProgress size={"large"}/>
                          </div>
                        </div>
                    )
                }
              </DataTable>

              <Spacer height={"20px"}/>

              <p>Number of White Cards: <b>{this.state.white_cards_selected}</b></p>
              <p>Number of Black Cards: <b>{this.state.black_cards_selected}</b></p>


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
                  name={"trade_points_redraw"}
                  checked={this.state.form.trade_points_redraw}
                  onChange={this.updateCheckbox}
              />

              <Checkbox
                  label="Rando Cardrissian extra player, plays next white cards in deck"
                  name={"rando_cardrissian"}
                  checked={this.state.form.rando_cardrissian}
                  onChange={this.updateCheckbox}
              />

              <Spacer height={"20px"}/>


              <div>
                <Button raised onClick={this.submitForm} disabled={this.state.processing}>
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
