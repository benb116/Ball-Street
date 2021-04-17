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
      const out = a[sorts.sortProp] > b[sorts.sortProp];
      return (out ? 1 : -1)*(sorts.sortDesc ? 1 : -1);
    });

  useEffect(() => {
    dispatch(getPlayers({leagueID, contestID}));
  }, [contestID, dispatch, leagueID]);

  return (
    <div className="container mx-auto">
      Players
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
      <th onClick={handleClick} value="name">Name</th>
      <th onClick={handleClick} value="posName">Pos</th>
      <th onClick={handleClick} value="teamAbr">Team</th>
      <th onClick={handleClick} value="preprice">Proj</th>
      <th onClick={handleClick} value="statprice">Pts</th>
      <th onClick={handleClick} value="last">Last Trade</th>
      <th onClick={handleClick} value="bid">Best Bid</th>
      <th onClick={handleClick} value="ask">Best Ask</th>
      <th onClick={handleClick} value="add">Add</th>
      <th>Offer</th>
    </tr>
  )
}


export default Players;
