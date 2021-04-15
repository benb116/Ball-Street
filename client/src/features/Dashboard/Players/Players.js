import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from 'react-loader-spinner';
import { useHistory, useParams } from 'react-router-dom';

import { getPlayers, playersSelector, filterSelector, setFilter} from './PlayersSlice';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';

const Players = () => {
  
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const theplayers = useSelector(playersSelector);
  const filters = useSelector(filterSelector);

  const filterplayers = theplayers
    .filter(p => p.name.toLowerCase().includes(filters.name))
    .filter(p => (p.posName === filters.posName || filters.posName === ''))
    .filter(p => (p.teamAbr === filters.teamAbr || filters.teamAbr === ''))

  useEffect(() => {
    dispatch(getPlayers({leagueID, contestID}));
  }, []);


  return (
    <div className="container mx-auto">
      Players
      <PlayerFilter />
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
        {filterplayers.map(function(player, index){
          return <PlayerItem key={ index } playerdata={ player }/>;
        })}
      </table>
    </div>
  );
};

function PlayerFilter() {
  const dispatch = useDispatch();
  const filters = useSelector(filterSelector);

  function handleChange(evt) {
    const name = evt.target.name;
    const value = evt.target.value;
    dispatch(setFilter({name, value}))
  }

  return (
    <form>
      <input onChange={handleChange} name="name" value={filters.name}></input>
      <select onChange={handleChange} name="posName" value={filters.posName}>
        <option value="">Pos</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
        <option value="FLEX">FLEX</option>
        <option value="K">K</option>
        <option value="DEF">DEF</option>
      </select>
      <select onChange={handleChange} name="teamAbr" value={filters.team}>
        <option value="">Team</option>
        <option value="ARI">ARI</option>
        <option value="ATL">ATL</option>
        <option value="BAL">BAL</option>
        <option value="BUF">BUF</option>
        <option value="CAR">CAR</option>
        <option value="CHI">CHI</option>
        <option value="CIN">CIN</option>
        <option value="CLE">CLE</option>
        <option value="DAL">DAL</option>
        <option value="DEN">DEN</option>
        <option value="DET">DET</option>
        <option value="GB">GB</option>
        <option value="HOU">HOU</option>
        <option value="IND">IND</option>
        <option value="JAX">JAX</option>
        <option value="KC">KC</option>
        <option value="MIA">MIA</option>
        <option value="MIN">MIN</option>
        <option value="NE">NE</option>
        <option value="NO">NO</option>
        <option value="NYG">NYG</option>
        <option value="NYJ">NYJ</option>
        <option value="LV">LV</option>
        <option value="PHI">PHI</option>
        <option value="PIT">PIT</option>
        <option value="LAC">LAC</option>
        <option value="SF">SF</option>
        <option value="SEA">SEA</option>
        <option value="LAR">LAR</option>
        <option value="TB">TB</option>
        <option value="TEN">TEN</option>
        <option value="WAS">WAS</option>
      </select>
    </form>
  )
}

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
