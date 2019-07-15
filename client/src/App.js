import React from 'react';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import './App.css';
import {Landing} from './pages/Landing';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Route exact path="/" component={Landing} />
        </div>
      </Router>
    </div>
  );
}

export default App;
