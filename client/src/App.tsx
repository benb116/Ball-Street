import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import './App.css';

import { useAppSelector } from './app/hooks';
import Contest from './features/Contests/Contest';
import Contests from './features/Contests/Contests';
import Dashboard from './features/Dashboard/Dashboard';
import Home from './features/Home/Home';
import Verified from './features/Home/Verified';
import Account from './features/User/Account';
import Forgot from './features/User/Forgot';
import Login from './features/User/Login';
import Reset from './features/User/Reset';
import Signup from './features/User/Signup';
import { isLoggedInSelector } from './features/User/User.slice';

function App() {
  return (
    <div
      className="App"
      id="root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/verified" element={<Verified />} />
          <Route path="/resetPassword/:token" element={<Reset />} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />

          <Route path="/contests" element={<RequireAuth><Contests /></RequireAuth>} />
          <Route path="/contests/:contestID" element={<RequireAuth><Contest /></RequireAuth>} />
          <Route path="/contests/:contestID/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

interface Props {
  children: JSX.Element,
}

function RequireAuth(props: Props) {
  const { children } = props;
  const isLoggedIn = useAppSelector(isLoggedInSelector);
  return isLoggedIn ? children : <Navigate to="/login" />;
}
export default App;
