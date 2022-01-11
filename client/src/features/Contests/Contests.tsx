import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';

import { contestsSelector } from './ContestsSlice';
import { useGetContestsQuery } from '../../helpers/api';

import { ContestItemType } from '../types';

// Show info about all contests available
const Contests = () => {
  const allcontests = useAppSelector(contestsSelector);
  const sortedContests = [...allcontests].sort((a, b) => b.nflweek - a.nflweek);

  // Pull data
  useGetContestsQuery();

  return (
    <div className="container mx-auto">
      <>
        <div className="container mx-auto">
          <br />
          Contests
          <br />
          <ul>
            {sortedContests
              .map((contest) => <ContestItem key={contest.id} contestdata={contest} />)}
          </ul>
        </div>
      </>
    </div>
  );
};

function ContestItem({ contestdata }: { contestdata: ContestItemType }) {
  return (
    <li>
      <Link to={`/contests/${contestdata.id}`}>
        {contestdata.name}
        {' '}
        - Week
        {' '}
        {contestdata.nflweek}
      </Link>
    </li>
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
