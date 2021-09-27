/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { allTeamsSelector, playerSelector, priceMapSelector } from '../Players/PlayersSlice';

import { preDrop } from './EntrySlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { setModal } from '../Modal/ModalSlice';
import RenderPrice from '../../../helpers/util';

function RosterItem({ playerid, position }) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const thisplayer = useSelector(playerSelector(playerid));
  const theteams = useSelector(allTeamsSelector);

  const offers = useSelector(offersSelector);
  const priceMap = useSelector(priceMapSelector(playerid));

  if (!thisplayer || !theteams[thisplayer.NFLTeamId]) {
    return (<tr><td>{position}</td></tr>);
  }

  const thephase = theteams[thisplayer.NFLTeamId].phase;
  const dispProj = thephase === 'pre' ? thisplayer.preprice : (priceMap.projPrice || 0);
  const dispStat = thephase === 'pre' ? thisplayer.postprice : (priceMap.statPrice || 0);

  const onpredrop = () => {
    dispatch(preDrop({ leagueID, contestID, nflplayerID: playerid }));
  };

  const onask = () => {
    dispatch(setModal({
      nflplayerID: thisplayer.id,
      nflplayerName: thisplayer.name,
      isbid: false,
      price: (priceMap ? Number(priceMap.bestbid || 0) : dispProj),
      protected: true,
    }));
  };

  let playeroffer = null;
  playeroffer = offers.asks.find((o) => o.NFLPlayerId === thisplayer.id);

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ leagueID, contestID, offerID: oid }));
  };

  let oclick = onpredrop;
  let text = '–';
  if (thephase === 'mid') {
    if (playeroffer) {
      oclick = () => oncancelOffer(playeroffer.id);
      text = '✕';
    } else {
      oclick = onask;
      text = 'ASK';
    }
  }

  return (
    <tr playerid={thisplayer.id}>
      <td>{position}</td>
      <td>{thisplayer.name}</td>
      <td>{thisplayer.teamAbr}</td>
      <td style={{ textAlign: 'right' }}>{RenderPrice(dispStat)}</td>
      <td style={{ textAlign: 'right' }}>{RenderPrice(dispProj)}</td>
      <td style={{ textAlign: 'right' }}>{(priceMap && Number(priceMap.lastprice)) ? Math.round(priceMap.lastprice / 100) : ''}</td>
      <td style={{ textAlign: 'right' }}>{(priceMap && Number(priceMap.bestbid)) ? Math.round(priceMap.bestbid / 100) : ''}</td>
      <td style={{ textAlign: 'right' }}>{(priceMap && Number(priceMap.bestask)) ? Math.round(priceMap.bestask / 100) : ''}</td>
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

RosterItem.propTypes = {
  playerid: PropTypes.number,
  position: PropTypes.string,
};

RosterItem.defaultProps = {
  playerid: null,
  position: null,
};

export default RosterItem;
