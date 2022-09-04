import React from 'react';

import { useAppSelector } from '../../../app/hooks';
import { RenderPrice } from '../../../helpers/util';

import { averageSelector } from './Leaderboard.slice';

// Show leaderboard of entries in the contest
function Leaderboards() {
  const avg = useAppSelector(averageSelector);
  return (
    <div
      style={{
        height: '50%',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <h3>
        Projected Average:
        {' '}
        {RenderPrice(avg)}
      </h3>
    </div>
  );
}

export default Leaderboards;
