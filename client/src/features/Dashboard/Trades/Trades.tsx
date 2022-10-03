import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '@app/hooks';

import { playerSelector } from '../Players/Players.slice';
import { tradesSelector } from './Trades.slice';
import { useGetTradesQuery } from './Trades.api';

import { TradeItemType } from './Trades.types';

function Trades() {
  const { contestID } = useParams<{ contestID: string }>();
  const trades = useAppSelector(tradesSelector);

  if (!contestID) return null;

  useGetTradesQuery(contestID);

  return (
    <div
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
}

function TradeItem({ tradedata }: { tradedata: TradeItemType }) {
  // Pull some info about the nfl player
  const playerData = useAppSelector(playerSelector(tradedata.NFLPlayerId));
  if (!playerData) return null;
  return (
    <div>
      {new Date(tradedata.createdAt).toLocaleString()}
      {' '}
      {(tradedata.action)}
      {' '}
      {(playerData.name || '')}
      {' for '}
      {(tradedata.price / 100)}
    </div>
  );
}

TradeItem.propTypes = {
  tradedata: PropTypes.shape({
    id: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    NFLPlayerId: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default Trades;
