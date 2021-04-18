import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getPlayers, playersSelector, filterSelector, sortSelector, setSort} from './PlayersSlice';

import PlayerFilter from './PlayerFilter'
import PlayerItem from './PlayerItem';

const Players = () => {
  
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const theplayers = useSelector(playersSelector);
  const filters = useSelector(filterSelector);
  const sorts = useSelector(sortSelector);

  const filtersortplayers = theplayers
    .filter(p => p.name.toLowerCase().includes(filters.name))
    .filter(p => {
      if (filters.posName === 'FLEX') {
        return (['RB', 'WR', 'TE'].indexOf(p.posName) > -1);
      }
      return (p.posName === filters.posName || filters.posName === '');
    })
    .filter(p => (p.teamAbr === filters.teamAbr || filters.teamAbr === ''))
    .sort((a,b) => {
      const out = (a[sorts.sortProp] || 0) > (b[sorts.sortProp] || 0);
      return (out ? 1 : -1)*(sorts.sortDesc ? 1 : -1);
    });

  useEffect(() => {
    dispatch(getPlayers({leagueID, contestID}));
  }, [contestID, dispatch, leagueID]);

  return (
    <div className="container mx-auto" style={{
      display: "inline-block",
      float: "left",
      width: "40%",
      padding: "0.5em",
      "box-sizing": "border-box",
    }}>
      <h3>Players</h3>
      <PlayerFilter />
      <table>
        <tbody>
          <ListHeader />
          {filtersortplayers.map(function(player, index){
            return <PlayerItem key={ index } playerdata={ player }/>;
          })}
        </tbody>
      </table>
    </div>
  );
};

function ListHeader() {
  const dispatch = useDispatch();

  function handleClick(evt) {
    console.log(evt.target.getAttribute('value'));
    dispatch(setSort(evt.target.getAttribute('value')))
  }

  return (
    <tr>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="name">Name</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="posName">Pos</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="teamAbr">Team</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="preprice">Proj</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="statprice">Pts</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="lastprice">Last</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="bestbid">Bid</th>
      <th style={{cursor:'pointer'}} onClick={handleClick} value="bestask">Ask</th>
      <th>Add</th>
      <th>Offer</th>
    </tr>
  )
}


export default Players;
