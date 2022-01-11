import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import RenderPrice from '../../helpers/util';

import { contestSelector, entriesSelector, myEntrySelector } from './ContestsSlice';
import {
  useGetContestQuery,
  useGetEntriesQuery,
  useGetEntryQuery,
  useCreateEntryMutation,
} from '../../helpers/api';

import { EntryItemType } from '../types';

// Show info about a specific contest and its entries
const Contest = () => {
  const { contestID } = useParams<{ contestID: string }>(); // Get contestID from URL params

  const thiscontest = useAppSelector(contestSelector); // Get info about this contest
  const thiscontestentries = useAppSelector(entriesSelector); // Get the entries in this contest
  const sortedEntries = [...thiscontestentries]
    .sort((a, b) => (b.projTotal || b.pointtotal) - (a.projTotal || a.pointtotal)); // Sort by total points
  const thiscontestmyentry = useAppSelector(myEntrySelector);

  // Pull data
  useGetContestQuery(contestID);
  useGetEntriesQuery(contestID);
  useGetEntryQuery(contestID);

  // User wants to create an entry in this contest
  const [createEntry] = useCreateEntryMutation();

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
          />
        ))}
      </ul>

      <br />
      <br />
      {!thiscontestmyentry // If the user doesn't have an entry in this contest
        ? (
          <div>
            <button
              onClick={() => { createEntry(contestID); }}
              type="submit"
            >
              Create entry
            </button>
          </div>
        )
        : <Link to={`/contests/${contestID}/dashboard`}>Go to dashboard</Link>}
    </div>
  );
};

function EntryItem({ entrydata }: { entrydata: EntryItemType }) {
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
    projTotal: PropTypes.number,
  }).isRequired,
};
export default Contest;
