import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector, priceMapSelector } from '../Players/PlayersSlice';

import { preDrop } from './EntrySlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { setModal } from '../Modal/ModalSlice';

function RosterItem({ playerid, position }) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const thisplayer = useSelector(playerSelector(playerid));

  const offers = useSelector(offersSelector);
  const priceMap = useSelector(priceMapSelector(playerid));

  if (!thisplayer) {
    return (<tr><td>{position}</td></tr>);
  }

  const onpredrop = () => {
    dispatch(preDrop({ leagueID, contestID, nflplayerID: playerid }));
  };

  const onask = () => {
    dispatch(setModal({
      nflplayerID: thisplayer.id,
      nflplayerName: thisplayer.name,
      isbid: false,
      price: (priceMap ? Number(priceMap.bestbid || 0) : 0),
      protected: true,
    }));
  };

  let playeroffer = null;
  playeroffer = offers.asks.find((o) => o.NFLPlayerId === thisplayer.id);

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ leagueID, contestID, offerID: oid }));
  };

  return (
    <tr playerid={thisplayer.id}>
      <td>{position}</td>
      <td>{thisplayer.name}</td>
      <td>{thisplayer.teamAbr}</td>
      <td>{priceMap.statPrice}</td>
      <td>{priceMap.projPrice}</td>
      <td>{(priceMap && Number(priceMap.lastprice)) ? priceMap.lastprice : ''}</td>
      <td>{(priceMap && Number(priceMap.bestbid)) ? priceMap.bestbid : ''}</td>
      <td>{(priceMap && Number(priceMap.bestask)) ? priceMap.bestask : ''}</td>
      {thisplayer.id ? (
        <td>
          <button
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
            onClick={onpredrop}
            onKeyPress={onpredrop}
            type="button"
          >
            –
          </button>
        </td>
      ) : <td />}

      {playeroffer ? (
        <td>
          <button
            style={{
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={() => oncancelOffer(playeroffer.id)}
            type="button"
          >
            ✕
          </button>
        </td>
      ) : (
        <td>
          <button
            style={{
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={onask}
            type="button"
          >
            ASK
          </button>
        </td>
      )}
    </tr>
  );
}

RosterItem.propTypes = {
  playerid: PropTypes.number,
  position: PropTypes.string,
};

RosterItem.defaultProps = {
  playerid: null,
  position: null,
};

export default RosterItem;
