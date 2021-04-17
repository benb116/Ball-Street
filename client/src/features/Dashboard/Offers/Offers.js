import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { cancelOffer, getOffers, offersSelector } from './OffersSlice';

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
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const playerdata = useSelector(playerSelector(props.offerdata.NFLPlayerId))
  if (!playerdata) {
    return (<li></li>);
  }

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({leagueID, contestID, offerID: oid}))
  }

  return (
    <li>
        {playerdata.name} - {props.offerdata.price} - <span 
          onClick={() => oncancelOffer(props.offerdata.id)}
          style={{cursor:'pointer'}}
        >
          CANCEL
        </span>
    </li>
  );
}

export default Offers;
