import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../app/hooks';

import {
  useDepositMutation,
  useGetAccountQuery,
  useGetUserLedgerQuery,
  useLogoutMutation,
  useWithdrawMutation,
} from '../../helpers/api';
import { isLoggedInSelector, userSelector } from './User.slice';
import { DepositWithdrawType, LedgerEntryJoinedType } from './User.types';

const Account = () => {
  const { register, handleSubmit } = useForm();
  const { register: r2, handleSubmit: h2 } = useForm();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { email, cash, ledger } = useAppSelector(userSelector);
  const isLoggedIn = useAppSelector(isLoggedInSelector); // Use localstorage to know if logged in

  const [logout] = useLogoutMutation();
  const [deposit] = useDepositMutation();
  const [withdraw] = useWithdrawMutation();

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
    <div className="container mx-auto">
      <>
        <div className="container mx-auto">
          Account info
          {' '}
          <h3>{email}</h3>
          <h4>
            $
            {cash / 100}
          </h4>
          <Link to="/">Home</Link>
        </div>
        <br />
        <form className="space-y-6" onSubmit={handleSubmit(depositCents)} method="POST">
          <div>
            <div className="mt-1">
              <input
                id="depositamount"
                type="text"
                autoComplete="amount"
                {...register('amount')}
                required
              />
            </div>
          </div>
          <div>
            <button type="submit">
              Deposit
            </button>
          </div>
        </form>
        <br />
        <form className="space-y-6" onSubmit={h2(withdrawCents)} method="POST">
          <div>
            <div className="mt-1">
              <input
                id="withdrawamount"
                type="text"
                autoComplete="amount"
                {...r2('amount')}
                required
              />
            </div>
          </div>
          <div>
            <button type="submit">
              Withdraw
            </button>
          </div>
        </form>
        <br />
        <div>
          {ledger.map((entry) => <LedgerEntry key={entry.id} entrydata={entry} />)}
        </div>
        <button type="button" onClick={() => { if (pagenum > 1) setPagenum(pagenum - 1); }}>Previous</button>
        <button type="button" onClick={() => { setPagenum(pagenum + 1); }}>Next</button>
        <br />
        <button
          onClick={() => { logout(); }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Log Out
        </button>
      </>
    </div>
  );
};

function LedgerEntry({ entrydata }: { entrydata: LedgerEntryJoinedType }) {
  return (
    <div>
      {new Date(entrydata.createdAt).toString()}
      {' - '}
      {entrydata.LedgerKind.name}
      {' '}
      {entrydata.ContestId ? `Contest ${entrydata.ContestId} ` : ''}
      {entrydata.LedgerKind.isCredit ? '+' : '-'}
      $
      {entrydata.value / 100}
    </div>
  );
}

export default Account;
