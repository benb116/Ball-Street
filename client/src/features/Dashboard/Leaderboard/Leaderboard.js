import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { leadersSelector } from './LeaderboardSlice';

const Leaderboards = () => {
  const leaders = useSelector(leadersSelector);

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

function LeaderboardItem({ leaderdata }) {
  return (
    <div>
      {leaderdata.user}
      {' '}
      -
      {' '}
      {leaderdata.total}
    </div>
  );
}

LeaderboardItem.propTypes = {
  leaderdata: PropTypes.shape({
    user: PropTypes.string.isRequired,
    total: 0,
  }).isRequired,
};

export default Leaderboards;
