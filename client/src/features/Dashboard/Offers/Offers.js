import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getOffers, offersSelector } from './OffersSlice';

const Offers = () => {

  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  useEffect(() => {
    dispatch(getOffers({leagueID, contestID}));
  }, [contestID, dispatch, leagueID]);

  const offers = useSelector(offersSelector);

  return (
    <div className="container mx-auto">
      Offers
      <br/>
      Bids
      <ul>
        {offers.bids.map(function(offer, index){
          return <OfferItem key={ index } offerdata={ offer }/>;
        })}
      </ul>
      <br/>
      Asks
      <ul>
        {offers.asks.map(function(offer, index){
          return <OfferItem key={ index } offerdata={ offer }/>;
        })}
      </ul>
    </div>
  );
};

function OfferItem(props) {
  return (
    <li>
        {props.offerdata.id} - {props.offerdata.NFLPlayerId}
    </li>
  );
}

export default Offers;
