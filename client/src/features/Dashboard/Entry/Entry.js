import React, { useEffect } from 'react';
import { dispatch } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector, preDrop } from './EntrySlice';
import { create } from '../Offers/OffersSlice';


const Entry = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const thisentry = useSelector(entrySelector);
  const rpos = Object.keys(thisentry.roster);
  useEffect(() => {
    dispatch(getEntry({leagueID, contestID}));
  }, []);

  return (
    <div className="container mx-auto">
      Entry
      Balance: {thisentry.balance}
      <table>
        <tbody>
          <tr>
            <th>Pos</th>
            <th>Name</th>
            <th>Team</th>
            <th>Pts</th>
            <th>Proj</th>
            <th>Last Trade</th>
            <th>Best Bid</th>
            <th>Best Ask</th>
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
  const onpredrop = () => {
    dispatch(preDrop({leagueID: leagueID, contestID: contestID, nflplayerID: props.playerid}));
  }
  const onask = () => {
    dispatch(create({leagueID, contestID, offerobj: {
      nflplayerID: thisplayer.id,
      isbid: false,
      price: 900,
      protected: false,
    }}));
  }
  return (
    <tr playerid={thisplayer.id}>
      <td>{props.position}</td>
      <td>{thisplayer.name}</td>
      <td>{thisplayer.teamAbr}</td>
      <td>{thisplayer.statprice}</td>
      <td>{thisplayer.preprice}</td>
      <td>{thisplayer.lastprice}</td>
      <td>{thisplayer.bestbid}</td>
      <td>{thisplayer.bestask}</td>
      {thisplayer.id ? <td onClick={onpredrop}>DROP</td> : <td></td>}
      {thisplayer.id ? (
        <td onClick={onask}>ASK</td>
      ) : <td></td>}
    </tr>
  );
}


export default Entry;
