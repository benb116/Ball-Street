import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../../app/hooks';

import { allTeamsSelector, playerSelector } from '../Players/Players.slice';
import { offersSelector } from './Offers.slice';
import { useCancelOfferMutation, useGetOffersQuery } from './Offers.api';

import { OfferItemType } from './Offers.types';

// Show offers for different players
function Offers() {
  const { contestID } = useParams<{ contestID: string }>();
  const offers = useAppSelector(offersSelector);

  if (!contestID) return null;

  useGetOffersQuery(contestID);

  return (
    <div
      style={{
        height: '50%',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <h3>Offers</h3>
      {offers.bids.length ? (
        <div>
          <h4 style={{ margin: 0 }}>Bids</h4>
          <div>
            {offers.bids.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
          </div>
        </div>
      ) : (<div />)}
      {offers.asks.length ? (
        <div>
          <h4 style={{ margin: 0 }}>Asks</h4>
          <div>
            {offers.asks.map((offer) => <OfferItem key={offer.id} offerdata={offer} />)}
          </div>
        </div>
      ) : (<div />)}
    </div>
  );
}

function OfferItem({ offerdata }: { offerdata: OfferItemType }) {
  // Used for protected offer times
  // Value says whether a countdown has started
  // Count is a dummy variable that is updated to cause a rerender
  const [value, setValue] = useState(true); // integer state
  const [, setCount] = useState(0); // integer state
  const teamdata = useAppSelector(allTeamsSelector);
  const playerdata = useAppSelector(playerSelector(offerdata.NFLPlayerId));
  const { contestID } = useParams<{ contestID: string }>();
  const [cancelOffer] = useCancelOfferMutation();

  if (!contestID) return null;
  if (!playerdata) return null;
  const thephase = teamdata[playerdata?.NFLTeamId]?.phase;
  if (thephase !== 'mid') return null;

  const oncancelOffer = (oid: string) => {
    cancelOffer({ contestID, offerID: oid });
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
        className="ActionButton"
        type="button"
      >
        ✕
        {' '}
      </button>
      {' '}
      {playerdata.name}
      {' '}
      -
      {' '}
      {(offerdata.price / 100)}
      {' '}
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
