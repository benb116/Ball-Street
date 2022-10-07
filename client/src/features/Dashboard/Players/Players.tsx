/* eslint-disable no-nested-ternary */
import React from 'react';

import { useAppSelector, useAppDispatch } from '@app/hooks';

import {
  allPlayersSelector,
  filterSelector,
  sortSelector,
  setSort,
  allTeamsSelector,
  allGamesSelector,
  pricesMapSelector,
} from './Players.slice';
import { useGetPlayersQuery, useGetGamesQuery } from './Players.api';

import PlayerFilter from './PlayerFilter';
import PlayerItem from './PlayerItem';

import { GameItemType, SortByType } from './Players.types';

// Show list of all active players
function Players() {
  useGetPlayersQuery();
  useGetGamesQuery();

  const theplayers = useAppSelector(allPlayersSelector);
  const theteams = useAppSelector(allTeamsSelector);
  const thegames = useAppSelector(allGamesSelector);
  const filters = useAppSelector(filterSelector);
  const sorts = useAppSelector(sortSelector);
  const priceMap = useAppSelector(pricesMapSelector);

  // If we're filtering by a game
  const thegamefilter = filters.game;
  let thegame: (GameItemType | null) = null;
  if (thegamefilter !== '') {
    thegame = thegames[Number(thegamefilter)] || null;
  }

  // Run through filters then sorting
  const filtersortplayers = theplayers
    .filter((p) => {
      // Name filter
      if (!p.name.toLowerCase().includes(filters.name)) return false;

      // Position filter
      if (filters.posName === 'FLEX' && p.posName) {
        if (['RB', 'WR', 'TE'].indexOf(p.posName) === -1) return false;
      } else if (p.posName !== filters.posName && filters.posName !== '') return false;

      // Team filter
      const playerTeam = theteams[p.NFLTeamId];
      if (!playerTeam) return false;
      if (playerTeam.abr !== filters.teamAbr && filters.teamAbr !== '') return false;

      // Game filter
      if (
        thegame !== null
        && playerTeam.id !== thegame.HomeId
        && playerTeam.id !== thegame.AwayId
      ) return false;

      // Phase filter
      if (playerTeam.phase === 'post') return false;
      if (playerTeam.phase !== filters.phase && filters.phase !== '') return false;

      if (filters.injury === 'healthy' && p.injuryStatus) return false;
      if (filters.injury === 'probable' && (p.injuryStatus && p.injuryStatus !== 'P')) return false;

      return true;
    })
    .sort((a, b) => {
      const aPhase = theteams[a.NFLTeamId]?.phase;
      const bPhase = theteams[b.NFLTeamId]?.phase;

      const sortBy = sorts.sortProp; // What are we sorting by?
      if (sortBy === 'teamAbr') {
        const teamA = theteams[a.NFLTeamId];
        const teamB = theteams[b.NFLTeamId];
        if (!teamA || !teamB) return 0;
        return compare(teamA.abr, teamB.abr);
      }
      if (sortBy === 'lastprice' || sortBy === 'bestbid' || sortBy === 'bestask') {
        const [i1, i2] = [priceMap[a.id]?.[sortBy], priceMap[b.id]?.[sortBy]]; // Get that property
        return compare(i1 || 0, i2 || 0);
      }
      if (sortBy === 'projPrice') {
        let [item1, item2] = [a[sortBy], b[sortBy]];
        if (aPhase === 'pre') { item1 = a.preprice; }
        if (bPhase === 'pre') { item2 = b.preprice; }
        return compare(item1, item2);
      }
      if (sortBy === 'statPrice') {
        let [item1, item2] = [a[sortBy], b[sortBy]];
        if (aPhase === 'pre') { item1 = a.postprice; }
        if (bPhase === 'pre') { item2 = b.postprice; }
        return compare(item1, item2);
      }
      return compare(a[sortBy] || '', b[sortBy] || '');

      function compare(item1: number | string, item2: typeof item1) {
        // Should flip order?
        const flip = Number.isNaN(item1) ? 1 : -1;
        const out = (item1 || 0) > (item2 || 0); // Compare as boolean
        return (out ? 1 : -1) * (sorts.sortDesc ? 1 : -1) * flip;
      }
    });

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
      <table
        id="PlayerTable"
        style={{
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
}

// Header row for player list with clickable column titles
function ListHeader() {
  const dispatch = useAppDispatch();

  // Change sort
  function handleClick(label: SortByType) {
    dispatch(setSort(label));
  }
  const sorts = useAppSelector(sortSelector);
  const { sortProp, sortDesc } = sorts;

  return (
    <tr style={{ fontSize: '.8rem' }}>
      <th style={{ width: '12rem', cursor: 'pointer' }} onClick={() => { handleClick('name'); }}>
        Name
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'name' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.2rem', cursor: 'pointer' }} onClick={() => { handleClick('posName'); }}>
        Pos
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'posName' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.4rem', cursor: 'pointer' }} onClick={() => { handleClick('teamAbr'); }}>
        Team
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'teamAbr' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '3rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('projPrice'); }}>
        Proj
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'projPrice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '3rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('statPrice'); }}>
        Pts
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'statPrice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.5rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('lastprice'); }}>
        Last
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'lastprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.5rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('bestbid'); }}>
        Bid
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'bestbid' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.5rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('bestask'); }}>
        Ask
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'bestask' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '3rem', textAlign: 'center' }}>Action</th>
    </tr>
  );
}

export default Players;
