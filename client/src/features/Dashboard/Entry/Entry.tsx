import React from 'react';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '@app/hooks';
import { RenderPrice } from '@client/helpers/util';

import { allTeamsSelector, playersSelector, pricesMapSelector } from '../Players/Players.slice';
import { entrySelector } from './Entry.slice';
import { useGetEntryQuery } from '../../Contests/Contests.api';

import RosterItem from './RosterItem';

import { RosterPositions } from './Entry.types';

// Display the user's current entry (balance + players)
function Entry() {
  const { contestID } = useParams<{ contestID: string }>();
  const thisentry = useAppSelector(entrySelector);

  if (!contestID) return null;

  // Initial data pull
  useGetEntryQuery(contestID);

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
      <table id="EntryTable">
        <RosterHeader />
        <tbody>
          {RosterPositions.map((pos) => ( // Create a roster item for each position
            <RosterItem
              key={pos}
              position={pos}
              playerid={thisentry.roster[pos]}
            />
          ))}
          <PointTotals />
        </tbody>
      </table>
    </div>
  );
}

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
        <th style={{ width: '3rem', textAlign: 'center' }}>Action</th>
      </tr>
    </thead>
  );
}

// Table footer showing calculated point totals
function PointTotals() {
  const thisentry = useAppSelector(entrySelector);

  const rosterPlayerIDs = Object.values(thisentry.roster).filter((p) => p !== null) as number[]; // All playerIDs
  const players = useAppSelector(playersSelector(rosterPlayerIDs)); // Player DB info
  const priceMap = useAppSelector(pricesMapSelector); // Player proj and statprice info
  const theteams = useAppSelector(allTeamsSelector); // Are teams in pre or mid? Show different price as a result

  // Sum the stat totals and the projected totals
  const sum = RosterPositions.reduce((acc, pos) => {
    const out = acc;
    const thisplayerID = thisentry.roster[pos];
    const theplayer = players.find((p) => p.id === thisplayerID);
    if (!theplayer) { return out; }
    const playerTeam = theteams[theplayer.NFLTeamId];
    if (!playerTeam) { return out; }
    const thephase = playerTeam.phase;
    const dispProj = thephase === 'pre' ? theplayer.preprice : (priceMap[theplayer.id]?.projPrice || 0);
    const dispStat = thephase === 'pre' ? theplayer.postprice : (priceMap[theplayer.id]?.statPrice || 0);

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
