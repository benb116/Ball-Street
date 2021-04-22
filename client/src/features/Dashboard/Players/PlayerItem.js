import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';
import { setModal } from '../Modal/ModalSlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { priceMapSelector } from './PlayersSlice';

function PlayerItem({ playerdata }) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const offers = useSelector(offersSelector);

  const showDrop = useSelector(isOnRosterSelector(playerdata.id));
  const priceMap = useSelector(priceMapSelector(playerdata.id));

  const onpredrop = () => {
    dispatch(preDrop({ leagueID, contestID, nflplayerID: playerdata.id }));
  };

  const onpreadd = () => {
    dispatch(preAdd({ leagueID, contestID, nflplayerID: playerdata.id }));
  };

  const onask = () => {
    dispatch(setModal({
      nflplayerID: playerdata.id,
      nflplayerName: playerdata.name,
      isbid: false,
      price: (priceMap ? Number(priceMap.bestbid || playerdata.preprice) : playerdata.preprice),
      protected: true,
    }));
  };

  const onbid = () => {
    dispatch(setModal({
      nflplayerID: playerdata.id,
      nflplayerName: playerdata.name,
      isbid: true,
      price: (priceMap ? Number(priceMap.bestask || playerdata.preprice) : playerdata.preprice),
      protected: true,
    }));
  };

  const playerofferbids = offers.bids.find((o) => o.NFLPlayerId === playerdata.id);
  const playerofferasks = offers.asks.find((o) => o.NFLPlayerId === playerdata.id);
  const playeroffer = playerofferbids || playerofferasks;
  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ leagueID, contestID, offerID: oid }));
  };

  return (
    <tr playerid={playerdata.id}>
      <td style={{ width: '10rem', overflow: 'hidden' }}>{playerdata.name}</td>
      <td style={{ width: '2.2rem' }}>{playerdata.posName}</td>
      <td style={{ width: '2.2rem' }}>{playerdata.teamAbr}</td>
      <td style={{ width: '2rem' }}>{playerdata.preprice}</td>
      <td style={{ width: '2rem' }}>{playerdata.statprice}</td>
      <td style={{ width: '2rem' }}>{(priceMap && Number(priceMap.lastprice)) ? priceMap.lastprice : ''}</td>
      <td style={{ width: '2rem' }}>{(priceMap && Number(priceMap.bestbid)) ? priceMap.bestbid : ''}</td>
      <td style={{ width: '2rem' }}>{(priceMap && Number(priceMap.bestask)) ? priceMap.bestask : ''}</td>
      <td>
        <button
          style={{
            cursor: 'pointer', width: '2rem', fontWeight: 'bold', textAlign: 'center',
          }}
          onClick={(showDrop ? onpredrop : onpreadd)}
          type="button"
        >
          {showDrop ? '–' : '+'}
        </button>
      </td>
      {playeroffer ? (
        <td>
          <button
            style={{ cursor: 'pointer', width: '2rem', textAlign: 'center' }}
            onClick={() => oncancelOffer(playeroffer.id)}
            type="button"
          >
            ✕
          </button>
        </td>
      ) : (
        <td>
          <button
            style={{ cursor: 'pointer', width: '2rem', textAlign: 'center' }}
            onClick={(showDrop ? onask : onbid)}
            type="button"
          >
            {showDrop ? 'ASK' : 'BID'}
          </button>
        </td>
      )}
    </tr>
  );
}

PlayerItem.propTypes = {
  playerdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    posName: PropTypes.string.isRequired,
    teamAbr: PropTypes.string.isRequired,
    preprice: PropTypes.number.isRequired,
    statprice: PropTypes.number.isRequired,
  }).isRequired,
};

export default PlayerItem;
