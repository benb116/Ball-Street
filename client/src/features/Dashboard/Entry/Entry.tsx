import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { allTeamsSelector, playersSelector, pricesMapSelector } from '../Players/PlayersSlice';
import RenderPrice from '../../../helpers/util';

import { getEntry, entrySelector, rosterUpdateSelector } from './EntrySlice';

import RosterItem from './RosterItem';

// Display the user's current entry (balance + players)
const Entry = () => {
  const dispatch = useAppDispatch();
  const { contestID } = useParams<{ contestID: string }>();

  const thisentry = useAppSelector(entrySelector);
  const rUpdate = useAppSelector(rosterUpdateSelector); // Flag set if the entry should be updated
  const rpos = Object.keys(thisentry.roster); // All roster positions

  // Initial data pull
  useEffect(() => {
    dispatch(getEntry({ contestID }));
  }, [contestID, dispatch]);

  // When an offer is filled, the rUpdate flag is raised
  useEffect(() => {
    if (rUpdate) {
      dispatch(getEntry({ contestID }));
    }
  }, [contestID, dispatch, rUpdate]);

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
      <h3>Entry</h3>
      Balance:
      {' '}
      {RenderPrice(thisentry.balance)}
      <table>
        <RosterHeader />
        <tbody>
          {rpos.map((pos) => ( // Create a roster item for each position
            <RosterItem
              key={pos}
              data-position={pos}
              playerid={thisentry.roster[pos]}
            />
          ))}
          <PointTotals />
        </tbody>
      </table>
    </div>
  );
};

// Table header for the roster
function RosterHeader() {
  return (
    <thead>
      <tr style={{ fontSize: '.8rem' }}>
        <th style={{ width: '2.2rem' }}>Pos</th>
        <th style={{ width: '10rem' }}>Name</th>
        <th style={{ width: '2.2rem' }}>Team</th>
        <th style={{ width: '2rem', textAlign: 'right' }}>Pts</th>
        <th style={{ width: '2rem', textAlign: 'right' }}>Proj</th>
        <th style={{ width: '2rem', textAlign: 'right' }}>Last</th>
        <th style={{ width: '2rem', textAlign: 'right' }}>Bid</th>
        <th style={{ width: '2rem', textAlign: 'right' }}>Ask</th>
        <th style={{ width: '2rem', textAlign: 'center' }}>Action</th>
      </tr>
    </thead>
  );
}

// Table footer showing calculated point totals
function PointTotals() {
  const thisentry = useAppSelector(entrySelector);
  const rpos = Object.keys(thisentry.roster);

  const rosterPlayerIDs = Object.values(thisentry.roster).filter((p) => p !== null); // All playerIDs
  const players = useAppSelector(playersSelector(rosterPlayerIDs)); // Player DB info
  const priceMaps = useAppSelector(pricesMapSelector(rosterPlayerIDs)); // Player proj and statprice info
  const theteams = useAppSelector(allTeamsSelector); // Are teams in pre or mid? Show different price as a result

  // Sum the stat totals and the projected totals
  const sum = rpos.reduce((acc, pos) => {
    const out = acc;
    const thisplayerID = thisentry.roster[pos];
    const theplayer = players.find((p) => p.id === thisplayerID);
    if (!theplayer || !theteams[theplayer.NFLTeamId]) { return out; }
    const thephase = theteams[theplayer.NFLTeamId].phase;
    const dispProj = thephase === 'pre' ? theplayer.preprice : (priceMaps[thisplayerID].projPrice || 0);
    const dispStat = thephase === 'pre' ? theplayer.postprice : (priceMaps[thisplayerID].statPrice || 0);

    if (theplayer) {
      out[0] += Number(dispStat) || 0;
      out[1] += Number(dispProj) || 0;
    }
    return out;
  }, [thisentry.balance, thisentry.balance]);

  return (
    <tr>
      <td>Total</td>
      <td />
      <td />
      <td style={{ textAlign: 'right' }}>{RenderPrice(sum[0])}</td>
      <td style={{ textAlign: 'right' }}>{RenderPrice(sum[1])}</td>
    </tr>
  );
}

export default Entry;
