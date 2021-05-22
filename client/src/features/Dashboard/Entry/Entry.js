import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { phaseSelector, playersSelector, pricesMapSelector } from '../Players/PlayersSlice';

import { getEntry, entrySelector, rosterUpdateSelector } from './EntrySlice';

import RosterItem from './RosterItem';

const Entry = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const thisentry = useSelector(entrySelector);
  const rUpdate = useSelector(rosterUpdateSelector);
  const rpos = Object.keys(thisentry.roster);

  useEffect(() => {
    dispatch(getEntry({ leagueID, contestID }));
  }, [contestID, dispatch, leagueID]);

  // When an offer is filled, the rUpdate flag is raised
  useEffect(() => {
    if (rUpdate) {
      dispatch(getEntry({ leagueID, contestID }));
    }
  }, [contestID, dispatch, leagueID, rUpdate]);

  return (
    <div
      className="container mx-auto"
      style={{
        display: 'inline-block',
        float: 'left',
        width: '40%',
        padding: '0.5em',
        boxSizing: 'border-box',
      }}
    >
      <h3>Entry</h3>
      Balance:
      {' '}
      {thisentry.balance}
      <table>
        <RosterHeader />
        <tbody>
          {rpos.map((pos) => (
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
};

function RosterHeader() {
  const thephase = useSelector(phaseSelector);

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
        {thephase === 'pre' ? <th style={{ width: '2rem' }}>Drop</th> : <th aria-label="header" />}
        {thephase === 'mid' ? <th style={{ width: '2rem' }}>Offer</th> : <th aria-label="header" />}
      </tr>
    </thead>
  );
}

function PointTotals() {
  const thisentry = useSelector(entrySelector);
  const rpos = Object.keys(thisentry.roster);

  const rosterPlayerIDs = Object.values(thisentry.roster).filter((p) => p !== null);
  const players = useSelector(playersSelector(rosterPlayerIDs));
  const priceMaps = useSelector(pricesMapSelector(rosterPlayerIDs));

  const sum = rpos.reduce((acc, pos) => {
    const out = acc;
    const thisplayerID = thisentry.roster[pos];
    const theplayer = players.find((p) => p.id === thisplayerID);
    if (theplayer) {
      out[0] += Number(priceMaps[thisplayerID].statPrice) || 0;
      out[1] += Number(priceMaps[thisplayerID].projPrice) || 0;
    }
    return out;
  }, [thisentry.balance, thisentry.balance]);

  return (
    <tr>
      <td>Total</td>
      <td />
      <td />
      <td style={{ textAlign: 'right' }}>{sum[0]}</td>
      <td style={{ textAlign: 'right' }}>{sum[1]}</td>
    </tr>
  );
}

export default Entry;
