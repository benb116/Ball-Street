import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { allTeamsSelector, playerSelector } from '../Players/PlayersSlice';

import { cancelOffer, getOffers, offersSelector } from './OffersSlice';

// Show offers for different players
const Offers = () => {
  const dispatch = useDispatch();
  const { contestID } = useParams();

  useEffect(() => {
    dispatch(getOffers({ contestID }));
  }, [contestID, dispatch]);

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
      <h4 style={{ margin: 0 }}>Bids</h4>
      <div>
        {offers.bids.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
      </div>
      <h4 style={{ margin: 0 }}>Asks</h4>
      <div>
        {offers.asks.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
      </div>
    </div>
  );
};

function OfferItem({ offerdata }) {
  // Used for protected offer times
  // Value says whether a countdown has started
  // Count is a dummy variable that is updated to cause a rerender
  const [value, setValue] = useState(true); // integer state
  const [, setCount] = useState(0); // integer state

  const dispatch = useDispatch();
  const { contestID } = useParams();

  const playerdata = useSelector(playerSelector(offerdata.NFLPlayerId));
  const teamdata = useSelector(allTeamsSelector);
  const thephase = teamdata[playerdata?.NFLTeamId]?.phase;
  if (!playerdata || thephase !== 'mid') {
    return (<span />);
  }

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ contestID, offerID: oid }));
  };

  // Want to rerender this once a second if the expire flag is set
  // value flag says whether the countdown has started
  // update a dummy count in state to trigger rerender
  if (offerdata.expire && value) {
    setValue(false);
    setInterval(() => { setCount((c) => c + 1); }, 1000);
  }

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
      {' '}
      {(offerdata.price / 100)}
      {offerdata.protected ? '🔒' : ''}
      {offerdata.expire ? (` Fills in ${
        Math.max(0, Math.floor((offerdata.expire - Date.now()) / 1000))
      }`) : ''}
    </div>
  );
}

OfferItem.propTypes = {
  offerdata: PropTypes.shape({
    id: PropTypes.string.isRequired,
    NFLPlayerId: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    protected: PropTypes.bool.isRequired,
    expire: PropTypes.number,
  }).isRequired,
};

export default Offers;
