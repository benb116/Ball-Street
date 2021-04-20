import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { cancelOffer, getOffers, offersSelector } from './OffersSlice';

const Offers = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  useEffect(() => {
    dispatch(getOffers({ leagueID, contestID }));
  }, [contestID, dispatch, leagueID]);

  const offers = useSelector(offersSelector);

  return (
    <div
      className="container mx-auto"
      style={{
        height: '50%',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <h3>Offers</h3>
      <h4 style={{
        margin: 0,
      }}
      >
        Bids
      </h4>
      <div>
        {offers.bids.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
      </div>
      <h4 style={{
        margin: 0,
      }}
      >
        Asks
      </h4>
      <div>
        {offers.asks.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
      </div>
    </div>
  );
};

function OfferItem({ offerdata }) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const playerdata = useSelector(playerSelector(offerdata.NFLPlayerId));
  if (!playerdata) {
    return (<span />);
  }

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ leagueID, contestID, offerID: oid }));
  };

  return (
    <div>
      <button
        onClick={() => oncancelOffer(offerdata.id)}
        style={{ cursor: 'pointer' }}
        type="button"
      >
        ✕
        {' '}
      </button>
      {playerdata.name}
      {' '}
      -
      {offerdata.price}
    </div>
  );
}

OfferItem.propTypes = {
  offerdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    NFLPlayerId: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default Offers;
