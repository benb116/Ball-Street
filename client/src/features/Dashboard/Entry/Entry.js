import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector, playersSelector, priceMapSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector, preDrop, rosterUpdateSelector } from './EntrySlice';
import { cancelOffer, offersSelector } from '../Offers/OffersSlice';
import { setModal } from '../Modal/ModalSlice';


const Entry = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const thisentry = useSelector(entrySelector);
  const rUpdate = useSelector(rosterUpdateSelector);
  const rpos = Object.keys(thisentry.roster);

  useEffect(() => {
    dispatch(getEntry({leagueID, contestID}));
  }, [contestID, dispatch, leagueID]);

  useEffect(() => {
    if (rUpdate) {
      dispatch(getEntry({leagueID, contestID}));      
    }
  }, [contestID, dispatch, leagueID, rUpdate]);

  return (
    <div className="container mx-auto" style={{
      display: "inline-block",
      float: "left",
      width: "40%",
      padding: "0.5em",
      "boxSizing": "border-box",
    }}>
      <h3>Entry</h3>
      Balance: {thisentry.balance}
      <table>
        <thead>
          <tr style={{ fontSize: ".8rem", }}>
            <th style={{width: "2.2rem", }}>Pos</th>
            <th style={{width: "10rem", }}>Name</th>
            <th style={{width: "2.2rem", }}>Team</th>
            <th style={{width: "2rem", }}>Pts</th>
            <th style={{width: "2rem", }}>Proj</th>
            <th style={{width: "2rem", }}>Last</th>
            <th style={{width: "2rem", }}>Bid</th>
            <th style={{width: "2rem", }}>Ask</th>
            <th style={{width: "2rem", }}>Drop</th>
            <th style={{width: "2rem", }}>Ask</th>
          </tr>
          </thead>
          <tbody>
          {rpos.map(function(pos, index){
            return <RosterItem key={ index } position={pos} playerid={ thisentry.roster[pos] }/>;
          })}
          <PointTotals />
        </tbody>
      </table>
    </div>
  );
};

function PointTotals() {
  const thisentry = useSelector(entrySelector);
  const rpos = Object.keys(thisentry.roster);

  const players = useSelector(playersSelector(Object.values(thisentry.roster).filter(p => p !== null)));

  const sum = rpos.reduce((acc, pos) => {
    let out = acc;
    const thisplayerID = thisentry.roster[pos];
    const theplayer = players.find(p => p.id === thisplayerID);
    if (theplayer) {
      out[0] += Number(theplayer.statprice) || 0;
      out[1] += Number(theplayer.preprice) || 0;
    }
    return out;
  }, [thisentry.balance, thisentry.balance])

  return (<tr>
    <td>Total</td>
    <td></td>
    <td></td>
    <td>{sum[0]}</td>
    <td>{sum[1]}</td>
  </tr>);
}

function RosterItem(props) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const thisplayer = useSelector(playerSelector(props.playerid));

  const offers = useSelector(offersSelector);
  const priceMap = useSelector(priceMapSelector(props.playerid));

  if (!thisplayer) {
    return (<tr><td>{props.position}</td></tr>);
  }

  const onpredrop = () => {
    dispatch(preDrop({leagueID, contestID, nflplayerID: props.playerid}));
  }

  const onask = () => {
    dispatch(setModal({
      nflplayerID: thisplayer.id,
      nflplayerName: thisplayer.name,
      isbid: false,
      price: (priceMap ? Number(priceMap.bestbid || 0) : 0),
      protected: false,
    }));
  }

  let playeroffer = null;
  playeroffer = offers.asks.find(o => o.NFLPlayerId === thisplayer.id);

  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({leagueID, contestID, offerID: oid}))
  }

  return (
    <tr playerid={thisplayer.id}>
      <td>{props.position}</td>
      <td>{thisplayer.name}</td>
      <td>{thisplayer.teamAbr}</td>
      <td>{thisplayer.statprice}</td>
      <td>{thisplayer.preprice}</td>
      <td>{(priceMap && Number(priceMap.lastprice)) ? priceMap.lastprice : ""}</td>
      <td>{(priceMap && Number(priceMap.bestbid)) ? priceMap.bestbid : ""}</td>
      <td>{(priceMap && Number(priceMap.bestask)) ? priceMap.bestask : ""}</td>
      {thisplayer.id ? <td style={{cursor:'pointer', "fontWeight": "bold", textAlign: "center",}} onClick={onpredrop}>–</td> : <td></td>}
      {thisplayer.id ? (
        playeroffer ? 
        <td style={{cursor:'pointer', textAlign: "center",}} onClick={() => oncancelOffer(playeroffer.id)}>✕</td> :
        <td style={{cursor:'pointer', textAlign: "center",}} onClick={onask}>ASK</td>
      ) : <td></td>}
    </tr>
  );
}

export default Entry;
