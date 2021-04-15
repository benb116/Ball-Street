import React, { useEffect } from 'react';
import { dispatch } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector, preAdd, preDrop } from './EntrySlice';


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
      <table>
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
        </tr>
        {rpos.map(function(pos, index){
          return <RosterItem key={ index } position={pos} playerid={ thisentry.roster[pos] }/>;
        })}
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
      <td onClick={onpredrop}>DROP</td>
    </tr>
  );
}


export default Entry;
