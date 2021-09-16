import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { allGamesSelector, filterSelector, setFilter } from './PlayersSlice';

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
      <select style={{ cursor: 'pointer' }} onChange={handleChange} name="game" value={filters.game}>
        <option value="">Game</option>
        {thegames.map((g, i) => (
          <option key={g.HomeId} value={i}>
            {g.away.abr}
            {' '}
            vs.
            {' '}
            {g.home.abr}
          </option>
        ))}
      </select>
    </form>
  );
};

export default PlayerFilter;
