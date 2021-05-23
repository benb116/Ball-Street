import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  getPlayers, allPlayersSelector, filterSelector, sortSelector, setSort, phaseSelector,
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
      const out = (a[sorts.sortProp] || 0) > (b[sorts.sortProp] || 0);
      return (out ? 1 : -1) * (sorts.sortDesc ? 1 : -1);
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
        height: '100%',
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
          height: '100%',
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
  const thephase = useSelector(phaseSelector);

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
      {thephase === 'pre' ? <th style={{ width: '2rem', textAlign: 'center' }}>+/–</th> : <th aria-label="header" />}
      {thephase === 'mid' ? <th style={{ width: '2rem', textAlign: 'center' }}>Offer</th> : <th aria-label="header" />}
    </tr>
  );
}

export default Players;
