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
      form: {}
    };

    this.switchForm = () => {
      this.setState({isLogin: ! this.state.isLogin, form: {}});
    };

    this.setForm = (val) => {
      this.setState({form: val});
    };

    this.submitForm = () => {
      let api_path = "/api/auth/" + ((this.state.isLogin) ? "login" : "signup");
      fetch(api_path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.form),
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
              this.context.updateAppContext();
            }
          });
    };
  }


  render (){

    return (
        <div>
          <AppContext.Consumer>
            { (context) => {
                if( context.user.signed_in ){
                  return <Redirect to="/" />
                }
            }}
          </AppContext.Consumer>
          <Card style={{ width: '22rem' }}>
            <h1>{this.state.isLogin ? "Login": "Sign Up"}</h1>
            <form onSubmit={this.submitForm}>
              {( this.state.isLogin ) ?
                  (<LoginForm  form={this.state.form} setForm={this.setForm} />) :
                  (<SignUpForm  form={this.state.form} setForm={this.setForm} />)
              }
            </form>
            <CardActions>

              <div style={{marginLeft: "8%"}}>
              <Button raised onClick={this.submitForm}>
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
LoginBox.contextType = AppContext;


class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    props.setForm({email: "", password: ""});
    this.updateField = ev => {
      let data = props.form;
      data[ev.target.name] = ev.target.value;
      props.setForm(data);
    };
  }

  render() {
    return (
        <div>
          <TextField
              outlined
              type={"email"}
              style={{ width: '80%' }}
              label="Email Address"
              name="email"
              value={this.props.form.email || ''}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
          <TextField
              outlined
              style={{ width: '80%' }}
              label="Password"
              type="password"
              name="password"
              value={this.props.form.password || ''}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
        </div>
    )
  }
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);

    props.setForm({email: "", name: "", password: ""});
    this.updateField = ev => {
      let data = props.form;
      data[ev.target.name] = ev.target.value;
      props.setForm(data);
    };
  }


  render() {
    return (
        <div>
          <TextField
              outlined
              type={"text"}
              style={{ width: '80%' }}
              label="Full Name"
              name="name"
              value={this.props.form.name || ''}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
          <TextField
              outlined
              type={"email"}
              style={{ width: '80%' }}
              label="Email Address"
              name="email"
              value={this.props.form.email || ''}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
          <TextField
              outlined
              style={{ width: '80%' }}
              label="Password"
              type="password"
              name="password"
              value={this.props.form.password || ''}
              onChange={this.updateField}
          />
          <Spacer height={"12px"}/>
        </div>
    )
  }
}