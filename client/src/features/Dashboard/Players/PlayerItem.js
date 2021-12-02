/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';
import { setModal } from '../Modal/ModalSlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { allTeamsSelector, priceMapSelector } from './PlayersSlice';
import RenderPrice from '../../../helpers/util';

function PlayerItem({ playerdata }) {
  const dispatch = useDispatch();
  const { contestID } = useParams();
  const offers = useSelector(offersSelector);
  const theteams = useSelector(allTeamsSelector);

  const showDrop = useSelector(isOnRosterSelector(playerdata.id));
  const priceMap = useSelector(priceMapSelector(playerdata.id));

  const thephase = theteams[playerdata.NFLTeamId].phase;
  const teamAbr = theteams[playerdata.NFLTeamId].abr;

  const dispProj = thephase === 'pre' ? playerdata.preprice : (priceMap.projPrice || 0);
  const dispStat = thephase === 'pre' ? playerdata.postprice : (priceMap.statPrice || 0);

  const onpredrop = () => {
    dispatch(preDrop({ contestID, nflplayerID: playerdata.id }));
  };

  const onpreadd = () => {
    dispatch(preAdd({ contestID, nflplayerID: playerdata.id }));
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
    dispatch(cancelOffer({ contestID, offerID: oid }));
  };

  let oclick = (showDrop ? onpredrop : onpreadd);
  let text = (showDrop ? '–' : '+');
  if (thephase === 'mid') {
    if (playeroffer) {
      oclick = () => oncancelOffer(playeroffer.id);
      text = '✕';
    } else {
      oclick = (showDrop ? onask : onbid);
      text = (showDrop ? 'ASK' : 'BID');
    }
  }

  return (
    <tr playerid={playerdata.id}>
      <td style={{ width: '10rem', overflow: 'hidden' }}>
        {playerdata.name}
        {' '}
        <span style={{ fontSize: '0.75em', color: 'red' }}>
          {' '}
          {(playerdata.injuryStatus ? playerdata.injuryStatus : '')}
        </span>
      </td>
      <td style={{ width: '2.2rem' }}>{playerdata.posName}</td>
      <td style={{ width: '2.2rem' }}>{teamAbr}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{RenderPrice(dispProj)}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{RenderPrice(dispStat)}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.lastprice)) ? Math.round(priceMap.lastprice / 100) : ''}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.bestbid)) ? Math.round(priceMap.bestbid / 100) : ''}</td>
      <td style={{ width: '2rem', textAlign: 'right' }}>{(priceMap && Number(priceMap.bestask)) ? Math.round(priceMap.bestask / 100) : ''}</td>

      <ActionButton thephase={thephase} oclick={oclick} text={text} />
    </tr>
  );
}

function ActionButton({ thephase, oclick, text }) {
  if (thephase !== 'pre' && thephase !== 'mid') {
    return (<td />);
  }
  return (
    <td style={{ textAlign: 'center' }}>
      <button
        style={{
          cursor: 'pointer', width: '2rem', fontWeight: 'bold', textAlign: 'center', padding: 0,
        }}
        onClick={oclick}
        type="button"
      >
        {text}
      </button>
    </td>
  );
}

ActionButton.propTypes = {
  thephase: PropTypes.string.isRequired,
  oclick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

PlayerItem.propTypes = {
  playerdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    posName: PropTypes.string.isRequired,
    NFLTeamId: PropTypes.number.isRequired,
    injuryStatus: null,
    preprice: 0,
    postprice: 0,
    projPrice: 0,
    statPrice: 0,
    NFLTeam: PropTypes.shape({
      gamePhase: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default PlayerItem;
