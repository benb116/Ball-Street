import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import {
  contestSelector,
  createEntry,
  entriesSelector,
  getContest,
  getEntries,
  getMyEntry,
  myEntrySelector,
} from './ContestsSlice';

const Contest = () => {
  const dispatch = useDispatch();
  const { handleSubmit } = useForm();
  const { leagueID, contestID } = useParams();

  const thiscontest = useSelector(contestSelector);
  const thiscontestentries = useSelector(entriesSelector);
  const thiscontestmyentry = useSelector(myEntrySelector);
  useEffect(() => {
    dispatch(getContest({ leagueID, contestID }));
    dispatch(getEntries({ leagueID, contestID }));
    dispatch(getMyEntry({ leagueID, contestID }));
  }, [contestID, dispatch, leagueID]);

  const onCreateEntry = () => {
    dispatch(createEntry({ leagueID, contestID }));
  };

  return (
    <div className="container mx-auto">
      <span>Contest info</span>
      <br />
      {JSON.stringify(thiscontest)}
      <br />
      <br />
      Contest entries
      <br />
      <ul>
        {thiscontestentries.map((entry) => (
          <EntryItem
            key={entry.UserId}
            entrydata={entry}
            leagueID={leagueID}
            contestID={contestID}
          />
        ))}
      </ul>

      <br />
      <br />
      {!thiscontestmyentry
        ? (
          <form className="space-y-6" onSubmit={handleSubmit(onCreateEntry)} method="POST">
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create entry
              </button>
            </div>
          </form>
        )
        : <Link to={`/leagues/${leagueID}/contests/${contestID}/dashboard`}>Go to dashboard</Link>}
    </div>
  );
};

function EntryItem({ entrydata }) {
  return (
    <li>
      {' '}
      {entrydata.UserId}
      {' '}
    </li>
  );
}

EntryItem.propTypes = {
  entrydata: PropTypes.shape({
    UserId: PropTypes.number.isRequired,
  }).isRequired,
};
export default Contest;
