import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../app/hooks';

import { playerSelector } from '../Players/PlayersSlice';
import { tradesSelector, tradeUpdateSelector } from './TradesSlice';
import { useGetTradesQuery } from '../../../helpers/api';

import { TradeItemType } from '../../types';

const Trades = () => {
  const dispatch = useAppDispatch();
  const { contestID } = useParams<{ contestID: string }>();
  const tUpdate = useAppSelector(tradeUpdateSelector);

  const { refetch } = useGetTradesQuery(contestID);

  useEffect(() => {
    if (tUpdate) refetch();
  }, [contestID, dispatch, tUpdate]);

  const trades = useAppSelector(tradesSelector);
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

function TradeItem({ tradedata }: { tradedata: TradeItemType }) {
  // Pull some info about the nfl player
  const playerData = useAppSelector(playerSelector(tradedata.NFLPlayerId));
  return (
    <div>
      {(tradedata.isbid ? 'Added' : 'Dropped')}
      -
      {(playerData?.name || '')}
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
