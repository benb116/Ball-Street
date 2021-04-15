import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector } from './EntrySlice';


const Entry = () => {
  const dispatch = useDispatch();
  // const { register, errors, handleSubmit } = useForm();
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
          <th>Player Name</th>
          <th>Position</th>
          <th>Team</th>
          <th>Projection</th>
          <th>Last Trade</th>
          <th>Best Bid</th>
          <th>Best Ask</th>
          <th>Points</th>
        </tr>
        {rpos.map(function(pos, index){
          return <RosterItem key={ index } playerid={ thisentry.roster[pos] }/>;
        })}
      </table>
    </div>
  );
};


function RosterItem(props) {
  const thisplayer = useSelector(playerSelector(props.playerid));
  return (
    <tr playerid={thisplayer.id}>
      <td>{thisplayer.name}</td>
      <td>{thisplayer.NFLPositionId}</td>
      <td>{thisplayer.NFLTeamId}</td>
      <td>{thisplayer.preprice}</td>
      <td>{thisplayer.statprice}</td>
    </tr>
  );
}


export default Entry;
