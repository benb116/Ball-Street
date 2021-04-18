import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Entry from './Entry/Entry'
import Players from './Players/Players'
import Offers from './Offers/Offers'
import Leaderboard from './Leaderboard/Leaderboard'

import { init } from './ws'

const Dashboard = () => {

  const { contestID } = useParams();

  useEffect(() => {
    init(contestID);
  }, [contestID]);

  return (
    <div className="container mx-auto" style={{
        textAlign: "left",
        height: "100%",
        width: "100%",
      }}>
      {/* Dashboard */}
      <Entry />
      <Players />
      <div style={{
        display: "inline-block",
        float: "left",
        padding: "0.5em",
        height: "100%",
      }}>
        <Offers />
        <Leaderboard />
      </div>
    </div>
  );
};

export default Dashboard;
