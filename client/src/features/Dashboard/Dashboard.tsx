import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Entry from './Entry/Entry';
import Leaderboard from './Leaderboard/Leaderboard';
import OfferModal from './Modal/Modal';
import Offers from './Offers/Offers';
import Players from './Players/Players';
import Trades from './Trades/Trades';
import initWS from './ws';

function Dashboard() {
  const { contestID } = useParams<{ contestID: string }>();
  useEffect(() => {
  // Init the WS for a specific contest
    if (contestID) initWS(contestID);
  }, [contestID]);
  if (!contestID) return null;

  return (
    <div
      style={{
        textAlign: 'left',
        height: '100%',
        width: '100%',
        fontSize: '1em',
      }}
    >
      <div style={{
        display: 'inline-block',
        float: 'left',
        padding: '0.5em',
        width: '40%',
        height: '100%',
        boxSizing: 'border-box',
        flexFlow: 'column',
      }}
      >
        <Entry />
        <Trades />
      </div>
      <Players />
      <div style={{
        display: 'inline-block',
        float: 'right',
        padding: '0.5em',
        width: '20%',
        height: '100%',
        boxSizing: 'border-box',
        flexFlow: 'column',
      }}
      >
        <Offers />
        <Leaderboard />
      </div>
      <OfferModal contestID={contestID} />
    </div>
  );
}

export default Dashboard;
