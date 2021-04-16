import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getOffers, offersSelector } from './OffersSlice';

const Offers = () => {

  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  useEffect(() => {
    dispatch(getOffers({leagueID, contestID}));
  }, []);

  const offers = useSelector(offersSelector);

  return (
    <div className="container mx-auto">
      Offers
      {JSON.stringify(offers)}
    </div>
  );
};

export default Offers;
