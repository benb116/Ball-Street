import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './LeaderboardSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

const Leaderboard = () => {
  
  return (
    <div className="container mx-auto">
      Leaderboard
    </div>
  );
};

export default Leaderboard;
