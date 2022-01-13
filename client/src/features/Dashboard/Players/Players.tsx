/* eslint-disable no-nested-ternary */
import React from 'react';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import {
  allPlayersSelector,
  filterSelector,
  sortSelector,
  setSort,
  allTeamsSelector,
  allGamesSelector,
  pricesMapSelector,
} from './PlayersSlice';
import { useGetPlayersQuery, useGetGamesQuery } from '../../../helpers/api';

import PlayerFilter from './PlayerFilter';
import PlayerItem from './PlayerItem';

import { GameItemType, SortByType } from '../../types';

// Show list of all active players
const Players = () => {
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
    thegame = thegames[Number(thegamefilter)];
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
      let item1;
      let item2;
      if (sortBy === 'teamAbr') {
        item1 = theteams[a.NFLTeamId].abr;
        item2 = theteams[b.NFLTeamId].abr;
      } else if (sortBy === 'lastprice' || sortBy === 'bestbid' || sortBy === 'bestask') {
        [item1, item2] = [priceMap[a.id][sortBy], priceMap[b.id][sortBy]]; // Get that property
      } else {
        [item1, item2] = [a[sortBy], b[sortBy]]; // Get that property
        if (sortBy === 'preprice') {
          if (aPhase !== 'pre') { item1 = a.projPrice; }
          if (bPhase !== 'pre') { item2 = b.projPrice; }
        }
        if (sortBy === 'postprice') {
          if (aPhase !== 'pre') { item1 = a.statPrice; }
          if (bPhase !== 'pre') { item2 = b.statPrice; }
        }
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
  const dispatch = useAppDispatch();

  // Change sort
  function handleClick(label: SortByType) {
    dispatch(setSort(label));
  }
  const sorts = useAppSelector(sortSelector);
  const { sortProp, sortDesc } = sorts;

  return (
    <tr style={{ fontSize: '.8rem' }}>
      <th style={{ width: '10rem', cursor: 'pointer' }} onClick={() => { handleClick('name'); }}>
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
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('preprice'); }}>
        Proj
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'preprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('postprice'); }}>
        Pts
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'postprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2.2rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('lastprice'); }}>
        Last
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'lastprice' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('bestbid'); }}>
        Bid
        <span style={{ fontSize: '0.5em' }}>
          {' '}
          {sortProp === 'bestbid' ? (sortDesc ? '▼' : '▲') : ''}
        </span>
      </th>
      <th style={{ width: '2rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => { handleClick('bestask'); }}>
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
