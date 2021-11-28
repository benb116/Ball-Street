import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  allGamesSelector, allTeamsSelector, filterSelector, setFilter,
} from './PlayersSlice';

function debounce(func, wait) {
  let timeout;
  return function d(...args) {
    const context = this;
    const later = function l() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const PlayerFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector(filterSelector);
  const thegames = useSelector(allGamesSelector);
  const theteams = useSelector(allTeamsSelector);

  const sortgames = [...thegames].sort((a, b) => a.startTime - b.startTime);

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
      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="teamAbr" value={filters.team}>
        <option value="">Team</option>
        {Object.keys(theteams).map((tid) => (theteams[tid].phase !== 'post' ? (
          <option key={theteams[tid].id} value={theteams[tid].abr}>{theteams[tid].abr}</option>
        ) : null))}
      </select>
      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="game" value={filters.game}>
        <option value="">Game</option>
        {sortgames.map((g, i) => {
          if (g.phase !== 'post') {
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
