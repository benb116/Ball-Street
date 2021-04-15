import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, clearState } from './PlayersSlice';
import Loader from 'react-loader-spinner';
import { useHistory, useParams } from 'react-router-dom';

import { getPlayers, playersSelector } from './PlayersSlice';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';



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
          <th>Name</th>
          <th>Pos</th>
          <th>Team</th>
          <th>Proj</th>
          <th>Pts</th>
          <th>Last</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Add</th>
        </tr>
        {theplayers.map(function(player, index){
          return <PlayerItem key={ index } playerdata={ player }/>;
        })}
      </table>
    </div>
  );
};

function PlayerItem(props) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const showDrop = useSelector(isOnRosterSelector(props.playerdata.id));

  const onpredrop = () => {
    dispatch(preDrop({leagueID: leagueID, contestID: contestID, nflplayerID: props.playerdata.id}));
  }

  const onpreadd = () => {
    dispatch(preAdd({leagueID: leagueID, contestID: contestID, nflplayerID: props.playerdata.id}));
  }

  return (
    <tr playerid={props.playerdata.id}>
      <td>{props.playerdata.name}</td>
      <td>{props.playerdata.posName}</td>
      <td>{props.playerdata.teamAbr}</td>
      <td>{props.playerdata.preprice}</td>
      <td>{props.playerdata.statprice}</td>
      <td>{props.playerdata.lastprice}</td>
      <td>{props.playerdata.bestbid}</td>
      <td>{props.playerdata.bestask}</td>
      <td onClick={(showDrop ? onpredrop : onpreadd)}>{showDrop ? 'DROP' : 'ADD'}</td>
    </tr>
  );
}

export default Players;
