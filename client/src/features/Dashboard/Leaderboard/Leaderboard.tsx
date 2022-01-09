import React from 'react';
import PropTypes from 'prop-types';
import { useAppSelector } from '../../../app/hooks';

import { leadersSelector } from './LeaderboardSlice';
import RenderPrice from '../../../helpers/util';
import { LeaderItemType } from '../../types';

// Show leaderboard of entries in the contest
const Leaderboards = () => {
  const leaders = useAppSelector(leadersSelector);

  return (
    <div
      className="container mx-auto"
      style={{
        height: '50%',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <h3>Leaderboard</h3>
      <div>
        {leaders.map((leader) => <LeaderboardItem key={leader.id} leaderdata={leader} />)}
      </div>
    </div>
  );
};

function LeaderboardItem({ leaderdata }: { leaderdata: LeaderItemType }) {
  return (
    <div>
      {leaderdata.user}
      {' '}
      -
      {' '}
      {RenderPrice(leaderdata.total)}
    </div>
  );
}

LeaderboardItem.propTypes = {
  leaderdata: PropTypes.shape({
    user: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default Leaderboards;
