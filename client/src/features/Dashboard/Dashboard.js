import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from '../User/UserSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

import Entry from './Entry/Entry'
import Players from './Players/Players'
import Offers from './Offers/Offers'
import Leaderboard from './Leaderboard/Leaderboard'

const Dashboard = () => {

  return (
    <div className="container mx-auto" style={{"text-align": "left"}}>
      Dashboard
      <Entry />
      <br/>
      <Players />
      <br/>
      <Offers />
      <br/>
      <Leaderboard />
      <br/>
    </div>
  );
};

export default Dashboard;
