import React from 'react';
import PropTypes from 'prop-types';
import {
  Link,
  useParams,
} from 'react-router-dom';

import { useAppSelector } from '../../app/hooks';
import RenderPrice from '../../helpers/util';

import { contestSelector, entriesSelector, myEntrySelector } from './Contests.slice';
import {
  useGetContestQuery,
  useGetEntriesQuery,
  useGetEntryQuery,
  useCreateEntryMutation,
} from '../../helpers/api';

import { EntryItemType } from '../Dashboard/Entry/Entry.types';

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
    <div style={{ marginTop: '10em' }}>
      <h2>
        {thiscontest?.name}
        {' '}
        - Week
        {' '}
        {thiscontest?.nflweek}
      </h2>
      <div
        id="ContestInfo"
        style={{
          display: 'inline-block',
          textAlign: 'left',
          verticalAlign: 'top',
          margin: '3em',
        }}
      >
        <h4>Contest info</h4>
        <p>
          Point Budget:
          {' '}
          {thiscontest?.budget / 100}
        </p>
        <p>
          Buy in: $
          {thiscontest?.buyin / 100}
        </p>
      </div>
      <div
        id="Entries"
        style={{
          display: 'inline-block',
          textAlign: 'left',
          verticalAlign: 'top',
          margin: '3em',
        }}
      >
        <h4>Entries</h4>
        <div>
          {sortedEntries.map((entry) => (
            <EntryItem
              key={entry.UserId}
              entrydata={entry}
              isUser={(entry.UserId === thiscontestmyentry?.UserId)}
            />
          ))}
        </div>
        {!thiscontestmyentry // If the user doesn't have an entry in this contest
          ? (
            <button className="AppButton" onClick={() => { createEntry(contestID); }} type="submit">
              Create entry
            </button>
          )
          : <Link className="AppButton AppLink" to={`/contests/${contestID}/dashboard`}>Go to dashboard</Link>}
      </div>

      <Link className="AppLink" to="/contests">Contests</Link>
    </div>
  );
};

function EntryItem({ entrydata, isUser }: { entrydata: EntryItemType, isUser: boolean }) {
  return (
    <div style={{
      fontWeight: (isUser ? 'bold' : 'normal'),
    }}
    >
      {entrydata.UserId}
      {' '}
      -
      {' '}
      {RenderPrice(entrydata.projTotal || entrydata.pointtotal)}
    </div>
  );
}

EntryItem.propTypes = {
  entrydata: PropTypes.shape({
    UserId: PropTypes.number.isRequired,
    pointtotal: PropTypes.number.isRequired,
    projTotal: PropTypes.number,
  }).isRequired,
  isUser: PropTypes.bool.isRequired,
};
export default Contest;
