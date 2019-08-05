import React from 'react';
import {NavBar} from "../comp/NavBar";
import {AppContext} from "../comp/AppProvider";

import {Redirect} from 'react-router-dom';

import {Card, CardActions} from '@rmwc/card';
import {Button} from "@rmwc/button";
import '@material/card/dist/mdc.card.css';
import '@material/button/dist/mdc.button.css';

import {Spacer} from "../comp/Spacer";

import {TextField} from "@rmwc/textfield";
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';

import {Queue} from "../comp/Queue";

export class Login extends React.Component {
  render () {
    return (
        <div>
          <NavBar/>
          <Spacer height="100px"/>
          <div className="flex-center">
            <LoginBox/>
          </div>
        </div>
    )
  }
}

export class LoginBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true,
      success: false,
      onSubmit: () => {}
    };
    this.setSubmit = func => {
      this.setState({onSubmit: func});
    };
    this.switchForm = () => {
      this.setState({isLogin: ! this.state.isLogin});
    };
    this.setSuccess = (val) => {
      this.setState({success: val});
    };

  }


  render (){
    return (
        <div>
          <AppContext.Consumer>
            { (context) => {
                if( this.state.success ){
                  this.setSuccess(false);
                  context.updateState();
                }
                if( context.state.signed_in ){
                  return <Redirect to="/" />
                }
            }}
          </AppContext.Consumer>
          <Card style={{ width: '22rem' }}>
            <h1>{this.state.isLogin ? "Login": "Sign Up"}</h1>

            {( this.state.isLogin ) ?
                (<LoginForm setSubmit={this.setSubmit} setSuccess={this.setSuccess}/>) :
                (<SignUpForm setSubmit={this.setSubmit} setSuccess={this.setSuccess}/>)
            }

            <CardActions>

              <div style={{marginLeft: "8%"}}>
              <Button raised onClick={this.state.onSubmit}>
                {this.state.isLogin ? "Login": "Sign Up"}
              </Button>

              &nbsp;&nbsp;

              <Button onClick={this.switchForm}>
                {this.state.isLogin ? "Sign Up": "Login"} Instead
              </Button>

              </div>
            </CardActions>
            <Spacer height={"12px"}/>
          </Card>
        </div>
    )
  }
}


class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };

    props.setSubmit(() => {
      // Perform a post request to the login api
      fetch("/api/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      })
          .then(response => response.json())
          .then( data => {
            if( ! data.success ){
              Queue.notify({
                body: data.error,
                actions: [
                  {
                    "icon": "close"
                  }
                ]
              });
            } else {
              this.props.setSuccess(true);
            }
          });
    });

    this.updateField = ev => {
      let data = {};
      data[ev.target.name]  = ev.target.value;
      this.setState(data);
    };

  }


  render() {
    return (
        <form>
          <TextField
              outlined
              type={"email"}
              style={{ width: '80%' }}
              label="Username or Email"
              name="username"
              value={this.state.username}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
          <TextField
              outlined
              style={{ width: '80%' }}
              label="Password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
        </form>
    )
  }
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    props.setSubmit(() => {
      alert("banana");
    })
  }


  render() {
    return (<h1>hello</h1>)
  }
}