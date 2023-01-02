import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';

import { contestsSelector } from './Contests.slice';
import { useGetContestsQuery } from './Contests.api';

import type { ContestItemType } from '../../../../types/api/contest.api';

// Show info about all contests available
function Contests() {
  useGetContestsQuery();
  const allcontests = useAppSelector(contestsSelector);
  const sortedContests = [...allcontests].sort((a, b) => b.nflweek - a.nflweek);

  return (
    <div style={{ marginTop: '10em' }}>
      <h2>Contests</h2>
      <div>
        {sortedContests
          .map((contest) => <ContestItem key={contest.id} contestdata={contest} />)}
      </div>
      <br />
      <Link className="AppLink" to="/">Home</Link>
    </div>
  );
}

function ContestItem({ contestdata }: { contestdata: ContestItemType }) {
  return (
    <div>
      <Link className="AppLink" to={`/contests/${contestdata.id}`}>
        {contestdata.name}
        {' '}
        - Week
        {' '}
        {contestdata.nflweek}
      </Link>
    </div>
  );
}

ContestItem.propTypes = {
  contestdata: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nflweek: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Contests;
