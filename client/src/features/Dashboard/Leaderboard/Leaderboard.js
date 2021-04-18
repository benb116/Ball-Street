import React from 'react';
import { useSelector } from 'react-redux';

import { leadersSelector } from './LeaderboardSlice';

const Leaderboards = () => {

  const leaders = useSelector(leadersSelector);

  return (
    <div className="container mx-auto" style={{
      height: "50%",
      "boxSizing": "border-box",
      flex: 1,
      display: 'flex',
      "flexFlow": "column",
    }}>
      <h3>Leaderboard</h3>
      <div>
        {leaders.map(function(leader, index){
          return <LeaderboardItem key={ index } leaderdata={ leader }/>;
        })}
      </div>
    </div>
  );
};

function LeaderboardItem(props) {
  return (
    <div>
        {props.leaderdata.user} - {props.leaderdata.total}
    </div>
  );
}

export default Leaderboards;
