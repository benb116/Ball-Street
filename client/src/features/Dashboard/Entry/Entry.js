import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './EntrySlice';
import Loader from 'react-loader-spinner';
import { useHistory, useParams } from 'react-router-dom';

import { getEntry } from './EntrySlice';


const Entry = () => {
  const { leagueID, contestID } = useParams();
  const dispatch = useDispatch();

  console.log(leagueID, contestID);

  useEffect(() => {
    dispatch(getEntry({leagueID, contestID}));
  }, []);

  return (
    <div className="container mx-auto">
      Entry
    </div>
  );
};

export default Entry;
