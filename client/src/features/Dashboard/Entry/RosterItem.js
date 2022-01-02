/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { allTeamsSelector, playerSelector, priceMapSelector } from '../Players/PlayersSlice';

import {
  preDrop, rposSelector, selectRPos, reorderRoster,
} from './EntrySlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { setModal } from '../Modal/ModalSlice';
import RenderPrice from '../../../helpers/util';

const flexID = 99;
const rosterkey = {
  QB1: 1,
  RB1: 2,
  RB2: 2,
  WR1: 3,
  WR2: 3,
  TE1: 4,
  FLEX1: flexID,
  FLEX2: flexID,
  K1: 5,
  DEF1: 6,
};

const NFLPosTypes = {
  1: { name: 'QB', canflex: false },
  2: { name: 'RB', canflex: true },
  3: { name: 'WR', canflex: true },
  4: { name: 'TE', canflex: true },
  5: { name: 'K', canflex: false },
  6: { name: 'DEF', canflex: false },
};
NFLPosTypes[flexID] = { name: 'FLEX', canflex: true };

// Show a specific row in the roster table
function RosterItem({ playerid, position }) {
  const dispatch = useDispatch();

  const { contestID } = useParams();
  const thisplayer = useSelector(playerSelector(playerid)); // Pull player info from state
  const theteams = useSelector(allTeamsSelector); // Pull team from state
  const rposSelected = useSelector(rposSelector); // Get current reordering flags

  const offers = useSelector(offersSelector); // Does this player have an active offer?
  const priceMap = useSelector(priceMapSelector(playerid)); // Player's stat and proj prices

  // When the pos label is clicked, trying to reorder roster
  const reorderClick = () => {
    // If flag has been set (a pos was previously clicked), try to reorder the two
    if (rposSelected[0] !== 0) {
      dispatch(reorderRoster({
        contestID,
        pos1: rposSelected[1],
        pos2: position,
      }));
      dispatch(selectRPos([0, '']));
    } else if (thisplayer.NFLPositionId) {
      dispatch(selectRPos([thisplayer.NFLPositionId, position]));
    } else {
      dispatch(selectRPos([rosterkey[position].type, position]));
    }
  };

  const shouldHighlight = () => {
    const selectedType = rposSelected[0];
    if (selectedType === 0) return false; // If flag is not set, then don't
    const thisType = rosterkey[position];
    if (selectedType !== thisType) {
      if (selectedType === flexID || thisType === flexID) {
        if (selectedType === flexID && !NFLPosTypes[position].canflex) return false;
        if (thisType === flexID && !NFLPosTypes[selectedType].canflex) return false;
        return true;
      }
      return false;
    }
    return true;
  };

  // If no player, show an empty row
  if (!thisplayer || !theteams[thisplayer.NFLTeamId]) {
    return (
      <tr>
        <td style={{ cursor: 'pointer', fontWeight: (shouldHighlight() ? 'bold' : 'normal') }} onClick={reorderClick}>{position}</td>
      </tr>
    );
  }

  // Pull player's game phase and determine prices to show
  const thephase = theteams[thisplayer.NFLTeamId].phase;
  const teamAbr = theteams[thisplayer.NFLTeamId].abr;
  const dispProj = thephase === 'pre' ? thisplayer.preprice : (priceMap.projPrice || 0);
  const dispStat = thephase === 'pre' ? thisplayer.postprice : (priceMap.statPrice || 0);
  const dispLast = priceMap?.lastprice ? Math.round(priceMap.lastprice / 100) : '';
  const dispBid = priceMap?.bestbid ? Math.round(priceMap.bestbid / 100) : '';
  const dispAsk = priceMap?.bestask ? Math.round(priceMap.bestask / 100) : '';

  // If user drops player (pregame)
  const onpredrop = () => {
    dispatch(preDrop({ contestID, nflplayerID: playerid }));
  };

  // If user wants to submit ask offer (midgame)
  const onask = () => {
    dispatch(setModal({
      nflplayerID: thisplayer.id,
      nflplayerName: thisplayer.name,
      isbid: false,
      price: (priceMap ? Number(priceMap.bestbid || 0) : dispProj),
      protected: true,
    }));
  };

  // Is there an active offer for the player
  let playeroffer = null;
  playeroffer = offers.asks.find((o) => o.NFLPlayerId === thisplayer.id);

  // If user wants to cancel an active offer
  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({ contestID, offerID: oid }));
  };

  // Which click handler to use depends on phase and if there's an offer
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
      <td style={{ cursor: 'pointer', fontWeight: (shouldHighlight() ? 'bold' : 'normal') }} onClick={reorderClick}>{position}</td>
      <td>
        {thisplayer.name}
        <span style={{ fontSize: '0.75em' }}>
          {' '}
          {posName(thisplayer.NFLPositionId)}
        </span>
        <span style={{ fontSize: '0.75em', color: 'red' }}>
          {' '}
          {(thisplayer.injuryStatus ? thisplayer.injuryStatus : '')}
        </span>
      </td>
      <td>{teamAbr}</td>
      <td style={{ textAlign: 'right' }}>{RenderPrice(dispStat)}</td>
      <td style={{ textAlign: 'right' }}>{RenderPrice(dispProj)}</td>
      <td style={{ textAlign: 'right' }}>{dispLast}</td>
      <td style={{ textAlign: 'right' }}>{dispBid}</td>
      <td style={{ textAlign: 'right' }}>{dispAsk}</td>
      <ActionButton thephase={thephase} oclick={oclick} text={text} />
    </tr>
  );
}

// Get the name of a position type from it's number
function posName(posNum) {
  if (!posNum) return '';
  return `(${NFLPosTypes[posNum].name})`;
}

// Generic action button that triggers a drop/offer/cancel
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
