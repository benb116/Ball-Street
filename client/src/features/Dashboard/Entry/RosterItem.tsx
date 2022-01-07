/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import {
  allTeamsSelector, NFLPosTypes, playerSelector, priceMapSelector,
} from '../Players/PlayersSlice';

import {
  preDrop, rposSelector, selectRPos, reorderRoster,
} from './EntrySlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { setModal } from '../Modal/ModalSlice';
import RenderPrice from '../../../helpers/util';
import { NFLPosType, OfferItemType } from '../../types';

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
type RosterPosType = 'QB1' | 'RB1' | 'RB2' | 'WR1' | 'WR2' | 'TE1' | 'FLEX1' | 'FLEX2' | 'K1' | 'DEF1';

// Show a specific row in the roster table
function RosterItem({ playerid, position }: { playerid: number | null, position: RosterPosType }) {
  const dispatch = useAppDispatch();

  const { contestID } = useParams<{ contestID: string }>();
  const thisplayer = useAppSelector(playerSelector(playerid)); // Pull player info from state
  const theteams = useAppSelector(allTeamsSelector); // Pull team from state
  const rposSelected = useAppSelector(rposSelector); // Get current reordering flags

  const offers = useAppSelector(offersSelector); // Does this player have an active offer?
  const priceMap = useAppSelector(priceMapSelector(playerid)); // Player's stat and proj prices

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
    } else if (thisplayer?.NFLPositionId) {
      dispatch(selectRPos([thisplayer.NFLPositionId, position]));
    } else {
      dispatch(selectRPos([rosterkey[position], position]));
    }
  };

  // Should a pos label be highlighted (If a clicked player could be moved there)
  const shouldHighlight = () => {
    const selectedType = rposSelected[0];
    if (selectedType === 0) return false; // If flag is not set, then don't
    const thisType = rosterkey[position];
    if (selectedType === thisType) return true; // If same pos type, can def do it
    if (selectedType === flexID || thisType === flexID) { // If either is a flex position
      if (selectedType === flexID && !NFLPosTypes[thisType].canflex) return false; // Can't if non-flex type can't flex
      if (thisType === flexID && !NFLPosTypes[selectedType].canflex) return false;
      return true;
    }
    return false;
  };

  // If no player, show an empty row
  if (!thisplayer || !theteams[thisplayer.NFLTeamId]) {
    return (
      <tr>
        <td
          style={{
            cursor: 'pointer',
            fontWeight: (shouldHighlight() ? 'bold' : 'normal'),
          }}
          onClick={reorderClick}
        >
          {position}
        </td>
      </tr>
    );
  }

  // Pull player's game phase and determine prices to show
  const thephase = theteams[thisplayer.NFLTeamId].phase;
  const teamAbr = theteams[thisplayer.NFLTeamId].abr;
  const dispProj = thephase === 'pre' ? thisplayer.preprice : (priceMap?.projPrice || 0);
  const dispStat = thephase === 'pre' ? thisplayer.postprice : (priceMap?.statPrice || 0);
  const dispLast = priceMap?.lastprice ? Math.round(priceMap.lastprice / 100) : '';
  const dispBid = priceMap?.bestbid ? Math.round(priceMap.bestbid / 100) : '';
  const dispAsk = priceMap?.bestask ? Math.round(priceMap.bestask / 100) : '';

  // If user drops player (pregame)
  const onpredrop = () => {
    dispatch(preDrop({ contestID, nflplayerID: thisplayer.id }));
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
  let playeroffer: OfferItemType | null = null;
  playeroffer = offers.asks.find((o) => o.NFLPlayerId === thisplayer.id) || null;

  // If user wants to cancel an active offer
  const oncancelOffer = (oid: string) => {
    if (!oid) return;
    dispatch(cancelOffer({ contestID, offerID: oid }));
  };

  // Which click handler to use depends on phase and if there's an offer
  let oclick = onpredrop;
  let text = '–';
  if (thephase === 'mid') {
    if (playeroffer) {
      oclick = () => oncancelOffer(playeroffer?.id || '');
      text = '✕';
    } else {
      oclick = onask;
      text = 'ASK';
    }
  }

  return (
    <tr data-playerid={thisplayer.id}>
      <td
        style={
        { cursor: 'pointer', fontWeight: (shouldHighlight() ? 'bold' : 'normal') }
        }
        onClick={reorderClick}
      >
        {position}
      </td>
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
function posName(posNum: NFLPosType) {
  return `(${NFLPosTypes[posNum].name})`;
}

// Generic action button that triggers a drop/offer/cancel
function ActionButton({ thephase, oclick, text }: { thephase: string, oclick: () => void, text: string }) {
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
