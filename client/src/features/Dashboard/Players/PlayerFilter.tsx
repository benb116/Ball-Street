import React from 'react';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import {
  allGamesSelector,
  allTeamsSelector,
  filterSelector,
  setFilter,
} from './PlayersSlice';

const debounce = (fn: (a: any) => any, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounceInner(this: any, ...args: [a: any]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Player list filter
// Name, Position, Team, Game, Game phase
const PlayerFilter = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(filterSelector);
  const thegames = useAppSelector(allGamesSelector);
  const theteams = useAppSelector(allTeamsSelector);

  function handleChange(evt) {
    const { name } = evt.target;
    const { value } = evt.target;
    dispatch(setFilter({ name, value }));
  }

  const handleChangeDebounce = debounce(handleChange, 300);

  return (
    <form>
      <input style={{ cursor: 'pointer' }} onChange={handleChangeDebounce} name="name" />

      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="posName" value={filters.posName}>
        <option value="">Pos</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
        <option value="FLEX">FLEX</option>
        <option value="K">K</option>
        <option value="DEF">DEF</option>
      </select>
      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="teamAbr" value={filters.teamAbr}>
        <option value="">Team</option>
        {Object.keys(theteams)
          .sort((a, b) => (theteams[a].abr > theteams[b].abr ? 1 : -1))
          .map((tid) => {
            if (theteams[tid].phase === 'post') return null;
            return <option key={theteams[tid].id} value={theteams[tid].abr}>{theteams[tid].abr}</option>;
          })}
      </select>

      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="game" value={filters.game}>
        <option value="">Game</option>
        {thegames.map((g, i) => {
          if (g && g.phase !== 'post') { // Hide games in post
            return (
              <option key={g.HomeId} value={i}>
                {g.away.abr}
                {' '}
                vs.
                {' '}
                {g.home.abr}
              </option>
            );
          }
          return null;
        })}
      </select>

      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="phase" value={filters.phase}>
        <option value="">Phase</option>
        <option value="pre">Pregame</option>
        <option value="mid">Midgame</option>
      </select>
    </form>
  );
};

export default PlayerFilter;
