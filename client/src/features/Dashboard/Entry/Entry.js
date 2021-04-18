import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector, priceMapSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector, preDrop, rosterUpdateSelector } from './EntrySlice';
import { cancelOffer, createOffer, offersSelector } from '../Offers/OffersSlice';


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
    }}>
      <h3>Entry</h3>
      Balance: {thisentry.balance}
      <table>
        <tbody>
          <tr>
            <th>Pos</th>
            <th>Name</th>
            <th>Team</th>
            <th>Pts</th>
            <th>Proj</th>
            <th>Last</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Drop</th>
            <th>Ask</th>
          </tr>
          {rpos.map(function(pos, index){
            return <RosterItem key={ index } position={pos} playerid={ thisentry.roster[pos] }/>;
          })}
        </tbody>
      </table>
    </div>
  );
};

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
    dispatch(createOffer({leagueID, contestID, offerobj: {
      nflplayerID: thisplayer.id,
      isbid: false,
      price: 900,
      protected: false,
    }}));
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
      {thisplayer.id ? <td style={{cursor:'pointer'}} onClick={onpredrop}>DROP</td> : <td></td>}
      {thisplayer.id ? (
        playeroffer ? 
        <td style={{cursor:'pointer'}} onClick={() => oncancelOffer(playeroffer.id)}>CANCEL</td> :
        <td style={{cursor:'pointer'}} onClick={onask}>ASK</td>
      ) : <td></td>}
    </tr>
  );
}

export default Entry;
