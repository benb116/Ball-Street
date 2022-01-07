import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

import { contestsSelector, getContests } from './ContestsSlice';

// Show info about all contests available
const Contests = () => {
  const dispatch = useAppDispatch();

  const allcontests = useAppSelector(contestsSelector);
  const sortedContests = [...allcontests].sort((a, b) => b.nflweek - a.nflweek);

  // Pull data
  const pullContests = () => {
    dispatch(getContests());
  };

  useEffect(pullContests, [dispatch]);

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

function ContestItem({ contestdata }) {
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
