import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './PlayersSlice';
import Loader from 'react-loader-spinner';
import { useHistory, useParams } from 'react-router-dom';

import { getPlayers, playersSelector } from './PlayersSlice';



const Players = () => {
  
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const theplayers = useSelector(playersSelector);

  useEffect(() => {
    dispatch(getPlayers({leagueID, contestID}));
  }, []);


  return (
    <div className="container mx-auto">
      Players
      {/* {JSON.stringify(theplayers)} */}
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
        {theplayers.map(function(player, index){
          return <PlayerItem key={ index } playerdata={ player }/>;
        })}
      </table>
    </div>
  );
};

function PlayerItem(props) {
  return (
    <tr playerid={props.playerdata.id}>
      <td>{props.playerdata.name}</td>
      <td>{props.playerdata.NFLPositionId}</td>
      <td>{props.playerdata.NFLTeamId}</td>
      <td>{props.playerdata.preprice}</td>
      <td>{props.playerdata.statprice}</td>
    </tr>
  );
}

export default Players;
