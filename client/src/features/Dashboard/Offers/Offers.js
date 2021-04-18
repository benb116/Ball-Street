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
    <div className="container mx-auto" style={{
      height: "50%",
      "boxSizing": "border-box",
      flex: 1,
      display: 'flex',
      "flexFlow": "column",
    }}>
      <h3>Offers</h3>
      <h4 style={{
        margin: 0,
      }}>Bids</h4>
      <div>
        {offers.bids.map(function(offer, index){
          return <OfferItem key={ index } offerdata={ offer }/>;
        })}
      </div>
      <h4 style={{
        margin: 0,
      }}>Asks</h4>
      <div>
        {offers.asks.map(function(offer, index){
          return <OfferItem key={ index } offerdata={ offer }/>;
        })}
      </div>
    </div>
  );
};

function OfferItem(props) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const playerdata = useSelector(playerSelector(props.offerdata.NFLPlayerId))
  if (!playerdata) {
    return (<span></span>);
  }

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({leagueID, contestID, offerID: oid}))
  }

  return (
    <div>
        <span 
          onClick={() => oncancelOffer(props.offerdata.id)}
          style={{cursor:'pointer'}}
        >✕ </span>
        {playerdata.name} - {props.offerdata.price}
    </div>
  );
}

export default Offers;
