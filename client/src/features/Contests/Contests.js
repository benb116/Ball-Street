import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { contestsSelector, getContests } from './ContestsSlice';

const Contests = () => {
  const dispatch = useDispatch();

  const allcontests = useSelector(contestsSelector);
  const sortedContests = [...allcontests].sort((a, b) => b.nflweek - a.nflweek);

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
