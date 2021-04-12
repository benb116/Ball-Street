import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './PlayersSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

const Players = () => {
  
  return (
    <div className="container mx-auto">
      Players
    </div>
  );
};

export default Players;
