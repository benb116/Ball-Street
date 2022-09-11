/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { ActionButton, RenderPrice } from '../../../helpers/util';

import { isOnRosterSelector } from '../Entry/Entry.slice';
import { setModal } from '../Modal/Modal.slice';
import { offersSelector } from '../Offers/Offers.slice';
import { allTeamsSelector, priceMapSelector } from './Players.slice';

import { PlayerItemType } from './Players.types';
import { usePreAddMutation, usePreDropMutation } from '../Entry/Entry.api';
import { useCancelOfferMutation } from '../Offers/Offers.api';

// Show a player's row in the list
function PlayerItem({ playerdata }: { playerdata: PlayerItemType }) {
  const dispatch = useAppDispatch();
  const { contestID } = useParams<{ contestID: string }>();

  const offers = useAppSelector(offersSelector);
  const theteams = useAppSelector(allTeamsSelector);

  const showDrop = useAppSelector(isOnRosterSelector(playerdata.id));
  const priceMap = useAppSelector(priceMapSelector(playerdata.id));

  const [preAdd] = usePreAddMutation();
  const [preDrop] = usePreDropMutation();
  const [cancelOffer] = useCancelOfferMutation();

  if (!contestID) return null;

  // Player's team info
  const thephase = theteams[playerdata.NFLTeamId].phase;
  const teamAbr = theteams[playerdata.NFLTeamId].abr;

  // Show correct price info
  const dispProj = thephase === 'pre' ? playerdata.preprice : (priceMap?.projPrice || 0);
  const dispStat = thephase === 'pre' ? playerdata.postprice : (priceMap?.statPrice || 0);
  const dispLast = priceMap?.lastprice ? Math.round(priceMap.lastprice / 100) : '';
  const dispBid = priceMap?.bestbid ? Math.round(priceMap.bestbid / 100) : '';
  const dispAsk = priceMap?.bestask ? Math.round(priceMap.bestask / 100) : '';

  // Player actions
  const onpredrop = () => {
    preDrop({ contestID, nflplayerID: playerdata.id });
  };

  const onpreadd = () => {
    preAdd({ contestID, nflplayerID: playerdata.id });
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
  const oncancelOffer = (oid: string) => {
    cancelOffer({ contestID, offerID: oid });
  };

  // Determine correct action for the player
  // based on whether they're on the roster, game phase, and offer status
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
    <tr data-playerid={playerdata.id}>
      <td style={{ width: '12rem', overflow: 'hidden' }}>
        {playerdata.name}
        {' '}
        <span style={{ fontSize: '0.75em', color: 'red' }}>
          {' '}
          {(playerdata.injuryStatus ? playerdata.injuryStatus : '')}
        </span>
      </td>
      <td style={{ width: '2.2rem' }}>{playerdata.posName}</td>
      <td style={{ width: '2.4rem' }}>{teamAbr}</td>
      <td style={{ width: '3rem', textAlign: 'right' }}>{RenderPrice(dispProj)}</td>
      <td style={{ width: '3rem', textAlign: 'right' }}>{RenderPrice(dispStat)}</td>
      <td style={{ width: '2.5rem', textAlign: 'right' }}>{dispLast}</td>
      <td style={{ width: '2.5rem', textAlign: 'right' }}>{dispBid}</td>
      <td style={{ width: '2.5rem', textAlign: 'right' }}>{dispAsk}</td>

      <ActionButton thephase={thephase} oclick={oclick} text={text} />
    </tr>
  );
}

PlayerItem.propTypes = {
  playerdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    posName: PropTypes.string.isRequired,
    NFLTeamId: PropTypes.number.isRequired,
    injuryStatus: PropTypes.string,
    preprice: PropTypes.number,
    postprice: PropTypes.number,
    projPrice: PropTypes.number,
    statPrice: PropTypes.number,
    NFLTeam: PropTypes.shape({
      gamePhase: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default PlayerItem;
