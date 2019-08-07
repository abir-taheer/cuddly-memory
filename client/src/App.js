import React from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import {Landing} from './pages/Landing';
import {Login} from './pages/Login';
import {MyGames} from "./pages/MyGames";

import { SnackbarQueue } from "@rmwc/snackbar";
import '@material/snackbar/dist/mdc.snackbar.css';
import '@material/button/dist/mdc.button.css';

import { Queue } from "./comp/Queue";


function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Route exact path="/" component={Landing}/>
            <Route exact path="/login" component={Login}/>
            <Route path="/my-games" component={MyGames} />
          </div>
        </Router>
        <SnackbarQueue messages={Queue.messages} />
      </div>
  );
}

export default App;
