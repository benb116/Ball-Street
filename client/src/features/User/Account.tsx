import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { useGetAccountQuery, useLogoutMutation } from '../../helpers/api';
import { isLoggedInSelector, userSelector } from './User.slice';

const Account = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { email, cash } = useAppSelector(userSelector);
  const isLoggedIn = useAppSelector(isLoggedInSelector); // Use localstorage to know if logged in

  const [logout] = useLogoutMutation();
  const loginRed = () => {
    localStorage.setItem('isLoggedIn', 'false');
    history.push('/login');
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

export default Account;
