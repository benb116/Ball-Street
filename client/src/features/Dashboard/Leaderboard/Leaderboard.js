import React from 'react';
import { useSelector } from 'react-redux';

import { leadersSelector } from './LeaderboardSlice';

const Leaderboards = () => {

  const leaders = useSelector(leadersSelector);

  return (
    <div className="container mx-auto">
      Leaderboard
      <br/>
      <ul>
        {leaders.map(function(leader, index){
          return <LeaderboardItem key={ index } leaderdata={ leader }/>;
        })}
      </ul>
    </div>
  );
};

function LeaderboardItem(props) {
  return (
    <li>
        {props.leaderdata.user} - {props.leaderdata.total}
    </li>
  );
}

export default Leaderboards;
