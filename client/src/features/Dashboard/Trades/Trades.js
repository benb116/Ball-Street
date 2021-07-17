import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { getTrades, tradesSelector } from './TradesSlice';

const Trades = () => {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  useEffect(() => {
    dispatch(getTrades({ leagueID, contestID }));
  }, [contestID, dispatch, leagueID]);

  const trades = useSelector(tradesSelector);
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
      <h3>Trades</h3>
      <div>
        {trades
          .map((trade) => <TradeItem key={trade.id} tradedata={trade} />)}
      </div>
    </div>
  );
};

function TradeItem({ tradedata }) {
  const playerData = (useSelector(playerSelector(tradedata.NFLPlayerId)) || {});
  return (
    <div>
      {(tradedata.isbid ? 'Added' : 'Dropped')}
      -
      {(playerData.name || '')}
      -
      {tradedata.price}
    </div>
  );
}

TradeItem.propTypes = {
  tradedata: PropTypes.shape({
    id: PropTypes.string.isRequired,
    NFLPlayerId: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    isbid: PropTypes.bool.isRequired,
  }).isRequired,
};

export default Trades;
