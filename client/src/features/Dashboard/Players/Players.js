import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  getPlayers, allPlayersSelector, filterSelector, sortSelector, setSort,
} from './PlayersSlice';

import PlayerFilter from './PlayerFilter';
import PlayerItem from './PlayerItem';

const Players = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const theplayers = useSelector(allPlayersSelector);
  const filters = useSelector(filterSelector);
  const sorts = useSelector(sortSelector);

  const filtersortplayers = theplayers
    .filter((p) => p.name.toLowerCase().includes(filters.name))
    .filter((p) => {
      if (filters.posName === 'FLEX') {
        return (['RB', 'WR', 'TE'].indexOf(p.posName) > -1);
      }
      return (p.posName === filters.posName || filters.posName === '');
    })
    .filter((p) => (p.teamAbr === filters.teamAbr || filters.teamAbr === ''))
    .sort((a, b) => {
      const aPhase = a.NFLTeam.gamePhase;
      const bPhase = b.NFLTeam.gamePhase;

      const sortBy = sorts.sortProp;
      let [item1, item2] = [a[sorts.sortProp], b[sorts.sortProp]];
      if (sortBy === 'preprice') {
        if (aPhase !== 'pre') {
          item1 = a.projPrice;
        }
        if (bPhase !== 'pre') {
          item2 = b.projPrice;
        }
      }
      if (sortBy === 'postprice') {
        if (aPhase !== 'pre') {
          item1 = a.statPrice;
        }
        if (bPhase !== 'pre') {
          item2 = b.statPrice;
        }
      }
      let flip = 1;
      if (['name', 'posName', 'teamAbr'].indexOf(sorts.sortProp) === -1) {
        item1 = Number(item1);
        item2 = Number(item2);
        flip = -1;
      }
      const out = (item1 || 0) > (item2 || 0);
      return (out ? 1 : -1) * (sorts.sortDesc ? 1 : -1) * flip;
    });

  useEffect(() => {
    dispatch(getPlayers({ leagueID, contestID }));
  }, [contestID, dispatch, leagueID]);

  return (
    <div
      className="container mx-auto"
      style={{
        display: 'flex',
        float: 'left',
        width: '40%',
        height: '95%',
        padding: '0.5rem',
        boxSizing: 'border-box',
        flexFlow: 'column',
        overflow: 'hidden',
      }}
    >
      <h3>Players</h3>
      <PlayerFilter />
      <table style={{
        height: '100%',
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
      }}
      >
        <thead>
          <ListHeader />
        </thead>
        <tbody style={{
          height: '85%',
          display: 'flex',
          overflowY: 'scroll',
          flexDirection: 'column',
        }}
        >
          {filtersortplayers.map((player) => <PlayerItem key={player.id} playerdata={player} />)}
        </tbody>
      </table>
    </div>
  );
};

function ListHeader() {
  const dispatch = useDispatch();

  function handleClick(evt) {
    dispatch(setSort(evt.target.getAttribute('value')));
  }

  return (
    <tr style={{ fontSize: '.8rem' }}>
      <th style={{ width: '10rem', cursor: 'pointer' }} onClick={handleClick} value="name">Name</th>
      <th style={{ width: '2.2rem', cursor: 'pointer' }} onClick={handleClick} value="posName">Pos</th>
      <th style={{ width: '2.2rem', cursor: 'pointer' }} onClick={handleClick} value="teamAbr">Team</th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="preprice">Proj</th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="postprice">Pts</th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="lastprice">Last</th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="bestbid">Bid</th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="bestask">Ask</th>
      <th style={{ width: '2rem', textAlign: 'center' }}>Action</th>
    </tr>
  );
}

export default Players;
