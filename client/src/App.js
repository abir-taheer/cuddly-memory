import React from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import {Landing} from './pages/Landing';
import {Login} from './pages/Login';


function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Route exact path="/" component={Landing}/>
            <Route exact path="/login" component={Login}/>
          </div>
        </Router>
      </div>
  );
}

export default App;
