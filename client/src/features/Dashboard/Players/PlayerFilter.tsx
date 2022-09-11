import React, { ChangeEvent } from 'react';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import {
  allGamesSelector,
  allTeamsSelector,
  FilterNameType,
  filterSelector,
  setFilter,
} from './Players.slice';

type EventType = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

const debounce = (fn: (a: EventType) => void, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function debounceInner(this: unknown, ...args: [a: EventType]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Player list filter
// Name, Position, Team, Game, Game phase
function PlayerFilter() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(filterSelector);
  const thegames = useAppSelector(allGamesSelector);
  const theteams = useAppSelector(allTeamsSelector);

  function handleChange(evt: EventType) {
    const { value } = evt.target;
    const filterName = evt.target.name as FilterNameType;
    dispatch(setFilter({ name: filterName, value }));
  }

  const handleChangeDebounce = debounce(handleChange, 300);

  return (
    <form>
      <input
        style={{
          width: '13em',
          cursor: 'pointer',
          borderColor: 'lightgray',
          borderWidth: '0.075em',
          boxShadow: 'white',
          borderRadius: '.5em',
          borderStyle: 'solid',
        }}
        placeholder="Player Name"
        onChange={handleChangeDebounce}
        name="name"
      />

      <select className="Dropdown" onChange={handleChange} name="posName" value={filters.posName}>
        <option value="">Pos</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
        <option value="FLEX">FLEX</option>
        <option value="K">K</option>
        <option value="DEF">DEF</option>
      </select>
      <select className="Dropdown" onChange={handleChange} name="teamAbr" value={filters.teamAbr}>
        <option value="">Team</option>
        {Object.keys(theteams)
          .sort((a, b) => (theteams[a].abr > theteams[b].abr ? 1 : -1))
          .map((tid) => {
            if (theteams[tid].phase === 'post') return null;
            return <option key={theteams[tid].id} value={theteams[tid].abr}>{theteams[tid].abr}</option>;
          })}
      </select>

      <select className="Dropdown" onChange={handleChange} name="game" value={filters.game}>
        <option value="">Game</option>
        {thegames.map((g, i) => {
          if (g && g.phase !== 'post') { // Hide games in post
            return (
              <option key={`${g.HomeId}-${g.AwayId}`} value={i}>
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

      <select className="Dropdown" onChange={handleChange} name="phase" value={filters.phase}>
        <option value="">Phase</option>
        <option value="pre">Pregame</option>
        <option value="mid">Midgame</option>
      </select>
      <select className="Dropdown" onChange={handleChange} name="injury" value={filters.injury}>
        <option value="">Injury Status</option>
        <option value="healthy">Healthy</option>
        <option value="probable">Probable</option>
      </select>
    </form>
  );
}

export default PlayerFilter;
