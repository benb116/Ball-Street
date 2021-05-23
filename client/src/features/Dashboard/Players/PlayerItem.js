/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';
import { setModal } from '../Modal/ModalSlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { phaseSelector, priceMapSelector } from './PlayersSlice';

function PlayerItem({ playerdata }) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const offers = useSelector(offersSelector);
  const thephase = useSelector(phaseSelector);

  const showDrop = useSelector(isOnRosterSelector(playerdata.id));
  const priceMap = useSelector(priceMapSelector(playerdata.id));

  const dispProj = thephase === 'pre' ? playerdata.preprice : playerdata.projPrice;
  const dispStat = thephase === 'pre' ? playerdata.postprice : playerdata.statPrice;

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
      price: (priceMap ? Number(priceMap.bestbid || dispProj) : dispProj),
      protected: true,
    }));
  };

  const onbid = () => {
    dispatch(setModal({
      nflplayerID: playerdata.id,
      nflplayerName: playerdata.name,
      isbid: true,
      price: (priceMap ? Number(priceMap.bestask || dispProj) : dispProj),
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
      <td style={{ width: '2rem', textAlign: 'right' }}>{dispProj}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{dispStat}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.lastprice)) ? priceMap.lastprice : ''}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.bestbid)) ? priceMap.bestbid : ''}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.bestask)) ? priceMap.bestask : ''}</td>
      {thephase === 'pre' ? (
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
      )
        : <td />}

      {thephase === 'mid' ? (
        playeroffer ? (
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
        )
      )
        : <td />}
    </tr>
  );
}

PlayerItem.propTypes = {
  playerdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    posName: PropTypes.string.isRequired,
    teamAbr: PropTypes.string.isRequired,
    preprice: 0,
    postprice: 0,
    projPrice: 0,
    statPrice: 0,
  }).isRequired,
};

export default PlayerItem;
