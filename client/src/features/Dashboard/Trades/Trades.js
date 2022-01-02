import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { playerSelector } from '../Players/PlayersSlice';

import { getTrades, tradesSelector, tradeUpdateSelector } from './TradesSlice';

const Trades = () => {
  const dispatch = useDispatch();
  const { contestID } = useParams();
  const tUpdate = useSelector(tradeUpdateSelector);

  useEffect(() => {
    dispatch(getTrades({ contestID }));
  }, [contestID, dispatch]);

  useEffect(() => {
    if (tUpdate) {
      dispatch(getTrades({ contestID }));
    }
  }, [contestID, dispatch, tUpdate]);

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
  // Pull some info about the nfl player
  const playerData = (useSelector(playerSelector(tradedata.NFLPlayerId)) || {});
  return (
    <div>
      {(tradedata.isbid ? 'Added' : 'Dropped')}
      -
      {(playerData.name || '')}
      -
      {(tradedata.price / 100)}
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
