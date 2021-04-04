import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './features/Home/Home';
import About from './features/About/About';
import Login from './features/User/Login';
import Signup from './features/User/Signup';
import Account from './features/User/Account';
import Leagues from './features/Leagues/Leagues';
import League from './features/Leagues/League';
import Contests from './features/Contests/Contests';
import Contest from './features/Contests/Contest';
import Dashboard from './features/Dashboard/Dashboard';
import { PrivateRoute } from './helpers/PrivateRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact component={Home} path="/" />
          <Route exact component={About} path="/about" />
          <Route exact component={Login} path="/login" />
          <Route exact component={Signup} path="/signup" />
          <PrivateRoute exact component={Account} path="/account" />
          <PrivateRoute exact component={Leagues} path="/leagues" />
          <PrivateRoute component={League} path="/league/:leagueID" />
          <PrivateRoute exact component={Contests} path="/contests" />
          <PrivateRoute component={Contest} path="/contest/:contestID" />
          <PrivateRoute exact component={Dashboard} path="/dashboard" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
