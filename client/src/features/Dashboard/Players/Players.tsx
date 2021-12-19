/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  getPlayers,
  allPlayersSelector,
  filterSelector,
  sortSelector,
  setSort,
  getGames,
  allTeamsSelector,
  allGamesSelector,
} from './PlayersSlice';

import PlayerFilter from './PlayerFilter';
import PlayerItem from './PlayerItem';

// Show list of all active players
const Players = () => {
  const dispatch = useDispatch();

  const theplayers = useSelector(allPlayersSelector);
  const theteams = useSelector(allTeamsSelector);
  const thegames = useSelector(allGamesSelector);
  const filters = useSelector(filterSelector);
  const sorts = useSelector(sortSelector);

  // If we're filtering by a game
  const thegamefilter = filters.game;
  let thegame = null;
  if (thegamefilter !== '') {
    thegame = thegames[Number(thegamefilter)];
  }

  // Run through filters then sorting
  const filtersortplayers = theplayers
    .filter((p) => {
      // Name filter
      if (!p.name.toLowerCase().includes(filters.name)) return false;

      // Position filter
      if (filters.posName === 'FLEX') {
        if (['RB', 'WR', 'TE'].indexOf(p.posName) === -1) return false;
      } else if (p.posName !== filters.posName && filters.posName !== '') return false;

      // Team filter
      if (!theteams[p.NFLTeamId]) return false;
      if (theteams[p.NFLTeamId].abr !== filters.teamAbr && filters.teamAbr !== '') return false;

      // Game filter
      if (
        thegame !== null
        && theteams[p.NFLTeamId].id !== thegame.HomeId
        && theteams[p.NFLTeamId].id !== thegame.AwayId
      ) return false;

      // Phase filter
      if (theteams[p.NFLTeamId].phase === 'post') return false;
      if (theteams[p.NFLTeamId].phase !== filters.phase && filters.phase !== '') return false;

      return true;
    })
    .sort((a, b) => {
      const aPhase = theteams[a.NFLTeamId]?.phase;
      const bPhase = theteams[b.NFLTeamId]?.phase;

      const sortBy = sorts.sortProp; // What are we sorting by?
      let [item1, item2] = [a[sortBy], b[sortBy]]; // Get that property
      if (sortBy === 'preprice') {
        if (aPhase !== 'pre') { item1 = a.projPrice; }
        if (bPhase !== 'pre') { item2 = b.projPrice; }
      }
      if (sortBy === 'postprice') {
        if (aPhase !== 'pre') { item1 = a.statPrice; }
        if (bPhase !== 'pre') { item2 = b.statPrice; }
      }
      if (sortBy === 'teamAbr') {
        item1 = theteams[a.NFLTeamId].abr;
        item2 = theteams[b.NFLTeamId].abr;
      }

      // Should flip order?
      let flip = 1;
      if (['name', 'posName', 'teamAbr'].indexOf(sortBy) === -1) {
        // Make numerical comparisons and switch order
        item1 = Number(item1);
        item2 = Number(item2);
        flip = -1;
      }
      const out = (item1 || 0) > (item2 || 0); // Compare as boolean
      return (out ? 1 : -1) * (sorts.sortDesc ? 1 : -1) * flip;
    });

  useEffect(() => {
    dispatch(getPlayers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getGames());
  }, [dispatch]);

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

// Header row for player list with clickable column titles
function ListHeader() {
  const dispatch = useDispatch();

  // Change sort
  function handleClick(evt) {
    dispatch(setSort(evt.target.getAttribute('value')));
  }
  const sorts = useSelector(sortSelector);
  const { sortProp, sortDesc } = sorts;

  return (
    <tr style={{ fontSize: '.8rem' }}>
      <th style={{ width: '10rem', cursor: 'pointer' }} onClick={handleClick} value="name">
        Name
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'name' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.2rem', cursor: 'pointer' }} onClick={handleClick} value="posName">
        Pos
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'posName' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.4rem', cursor: 'pointer' }} onClick={handleClick} value="teamAbr">
        Team
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'teamAbr' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="preprice">
        Proj
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'preprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="postprice">
        Pts
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'postprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="lastprice">
        Last
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'lastprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="bestbid">
        Bid
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'bestbid' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={handleClick} value="bestask">
        Ask
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'bestask' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', textAlign: 'center' }}>Action</th>
    </tr>
  );
}

export default Players;
