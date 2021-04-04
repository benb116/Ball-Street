import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { leaguesSelector, getUserLeagues, getPublicLeagues } from './LeaguesSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

const Leagues = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { userLeagues, publicLeagues } = useSelector(leaguesSelector);

  useEffect(() => {
    dispatch(getUserLeagues());
    dispatch(getPublicLeagues());
  }, []);

  return (
    <div className="container mx-auto">
      <Fragment>
        <div className="container mx-auto">
          Leagues {JSON.stringify(userLeagues)} {JSON.stringify(publicLeagues)}
        </div>
      </Fragment>
    </div>
  );
};

export default Leagues;
