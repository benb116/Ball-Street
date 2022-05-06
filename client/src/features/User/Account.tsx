import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../app/hooks';

import {
  useDepositMutation,
  useForcelogoutMutation,
  useGetAccountQuery,
  useGetUserLedgerQuery,
  useWithdrawMutation,
} from './User.api';
import { isLoggedInSelector, userSelector } from './User.slice';
import { DepositWithdrawType, LedgerEntryJoinedType } from './User.types';

const Account = () => {
  const { register, handleSubmit } = useForm<DepositWithdrawType>();
  const { register: r2, handleSubmit: h2 } = useForm<DepositWithdrawType>();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { email, cash, ledger } = useAppSelector(userSelector);
  const isLoggedIn = useAppSelector(isLoggedInSelector); // Use localstorage to know if logged in

  const [deposit] = useDepositMutation();
  const [withdraw] = useWithdrawMutation();
  const [forcelogout] = useForcelogoutMutation();

  const loginRed = () => {
    localStorage.setItem('isLoggedIn', 'false');
    history.push('/login');
  };

  const [pagenum, setPagenum] = useState(1);
  useGetUserLedgerQuery(pagenum, { refetchOnMountOrArgChange: true });

  const depositCents = (body: DepositWithdrawType) => {
    // eslint-disable-next-line no-param-reassign
    body.amount = Math.round(body.amount * 100);
    deposit(body);
  };
  const withdrawCents = (body: DepositWithdrawType) => {
    // eslint-disable-next-line no-param-reassign
    body.amount = Math.round(body.amount * 100);
    withdraw(body);
  };

  useEffect(() => {
    if (!isLoggedIn) loginRed();
  }, [dispatch, isLoggedIn, email]);

  useGetAccountQuery();

  return (
    <>
      <div style={{ marginTop: '10em' }}>
        <h2>Account details</h2>
        <p>
          Account balance: $
          {cash / 100}
        </p>
      </div>

      <div id="Transactions" style={{ display: 'inline-block', verticalAlign: 'top', margin: '3em' }}>
        <h4>Transactions</h4>
        <table>
          <tr>
            <th style={{ width: '15em' }}>Date</th>
            <th style={{ width: '10em' }}>Description</th>
            <th style={{ width: '5em' }}>Amount</th>
          </tr>
          {ledger.map((entry) => <LedgerEntry key={entry.id} entrydata={entry} />)}
        </table>
        Page
        {' '}
        {pagenum}
        <br />
        <br />
        <button className="SmallButton" type="button" onClick={() => { if (pagenum > 1) setPagenum(pagenum - 1); }}>Previous</button>
        <button className="SmallButton" type="button" onClick={() => { setPagenum(pagenum + 1); }}>Next</button>
      </div>

      <div id="DepWith" style={{ display: 'inline-block', verticalAlign: 'top', margin: '3em' }}>
        <h4>Deposits and Withdrawals</h4>
        <form onSubmit={handleSubmit(depositCents)} method="POST">
          <div>
            <input
              {...register('amount')}
              id="depositamount"
              type="text"
              className="AppInput"
              autoComplete="amount"
              placeholder="Deposit $"
              required
            />
          </div>
          <button className="AppButton" type="submit">Deposit</button>
        </form>
        <br />
        <form onSubmit={h2(withdrawCents)} method="POST">
          <input
            {...r2('amount')}
            id="withdrawamount"
            type="text"
            className="AppInput"
            autoComplete="amount"
            placeholder="Withdrawal $"
            required
          />
          <button className="AppButton" type="submit">Withdraw</button>
        </form>
      </div>

      <button
        className="SmallButton"
        type="button"
        onClick={() => { forcelogout(); }}
        style={{
          display: 'block',
          margin: '0 auto',
        }}
      >
        Force logout this user
      </button>

      <Link className="AppLink" to="/">Home</Link>

    </>
  );
};

function LedgerEntry({ entrydata }: { entrydata: LedgerEntryJoinedType }) {
  return (
    <tr>
      <td>
        {new Date(entrydata.createdAt).toLocaleString()}
      </td>
      <td>
        {entrydata.LedgerKind.name}
        {' '}
        {entrydata.ContestId ? `Contest ${entrydata.ContestId} ` : ''}
      </td>
      <td>
        {entrydata.LedgerKind.isCredit ? '+' : '-'}
        $
        {entrydata.value / 100}
      </td>
    </tr>
  );
}

export default Account;
