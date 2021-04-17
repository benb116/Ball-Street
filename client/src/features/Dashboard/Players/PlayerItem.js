import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';
import { cancelOffer, createOffer, offersSelector } from '../Offers/OffersSlice';
import { priceMapSelector } from './PlayersSlice';

function PlayerItem(props) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const offers = useSelector(offersSelector);

  const showDrop = useSelector(isOnRosterSelector(props.playerdata.id));
  const priceMap = useSelector(priceMapSelector(props.playerdata.id));

  const onpredrop = () => {
    dispatch(preDrop({leagueID, contestID, nflplayerID: props.playerdata.id}));
  }

  const onpreadd = () => {
    dispatch(preAdd({leagueID, contestID, nflplayerID: props.playerdata.id}));
  }

  const onask = () => {
    dispatch(createOffer({leagueID, contestID, offerobj: {
      nflplayerID: props.playerdata.id,
      isbid: false,
      price: 900,
      protected: false,
    }}));
  }

  const onbid = () => {
    dispatch(createOffer({leagueID, contestID, offerobj: {
      nflplayerID: props.playerdata.id,
      isbid: true,
      price: 900,
      protected: false,
    }}));
  }

  const playerofferbids = offers.bids.find(o => o.NFLPlayerId === props.playerdata.id);
  const playerofferasks = offers.asks.find(o => o.NFLPlayerId === props.playerdata.id);
  const playeroffer = playerofferbids || playerofferasks;
  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({leagueID, contestID, offerID: oid}))
  }

  return (
    <tr playerid={props.playerdata.id}>
      <td>{props.playerdata.name}</td>
      <td>{props.playerdata.posName}</td>
      <td>{props.playerdata.teamAbr}</td>
      <td>{props.playerdata.preprice}</td>
      <td>{props.playerdata.statprice}</td>
      <td>{(priceMap && Number(priceMap.lastprice)) ? priceMap.lastprice : ""}</td>
      <td>{(priceMap && Number(priceMap.bestbid)) ? priceMap.bestbid : ""}</td>
      <td>{(priceMap && Number(priceMap.bestask)) ? priceMap.bestask : ""}</td>
      <td style={{cursor:'pointer'}} onClick={(showDrop ? onpredrop : onpreadd)}>{showDrop ? 'DROP' : 'ADD'}</td>
      {playeroffer ? 
        <td style={{cursor:'pointer'}} onClick={() => oncancelOffer(playeroffer.id)}>CANCEL</td> :
        <td style={{cursor:'pointer'}} onClick={(showDrop ? onask : onbid)}>{showDrop ? 'ASK' : 'BID'}</td>
      }
    </tr>
  );
}

export default PlayerItem;
