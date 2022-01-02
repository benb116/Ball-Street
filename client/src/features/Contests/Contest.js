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
import RenderPrice from '../../helpers/util';

// Show info about a specific contest and its entries
const Contest = () => {
  const dispatch = useDispatch();
  const { handleSubmit } = useForm();
  const { contestID } = useParams(); // Get contestID from URL params

  const sortedEntries = [...thiscontestentries].sort((a, b) => b.pointtotal - a.pointtotal);
  const thiscontest = useSelector(contestSelector); // Get info about this contest
  const thiscontestentries = useSelector(entriesSelector); // Get the entries in this contest
  const thiscontestmyentry = useSelector(myEntrySelector);

  // Pull data
  useEffect(() => {
    dispatch(getContest({ contestID }));
    dispatch(getEntries({ contestID }));
    dispatch(getMyEntry({ contestID }));
  }, [contestID, dispatch]);

  // User wants to create an entry in this contest
  const onCreateEntry = () => {
    dispatch(createEntry({ contestID }));
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
        {sortedEntries.map((entry) => (
          <EntryItem
            key={entry.UserId}
            entrydata={entry}
            contestID={contestID}
          />
        ))}
      </ul>

      <br />
      <br />
      {!(Object.keys(thiscontestmyentry).length) // If the user doesn't have an entry in this contest
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
        : <Link to={`/contests/${contestID}/dashboard`}>Go to dashboard</Link>}
    </div>
  );
};

function EntryItem({ entrydata }) {
  return (
    <li>
      {entrydata.UserId}
      {' '}
      -
      {' '}
      {RenderPrice(entrydata.projTotal || entrydata.pointtotal)}
    </li>
  );
}

EntryItem.propTypes = {
  entrydata: PropTypes.shape({
    UserId: PropTypes.number.isRequired,
    pointtotal: PropTypes.number.isRequired,
  }).isRequired,
};
export default Contest;
