import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../app/hooks';

import { useGetAccountQuery, useLogoutMutation } from '../../helpers/api';
import { isLoggedInSelector, userSelector } from '../User/User.slice';

const Home = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { email } = useAppSelector(userSelector);
  const isLoggedIn = useAppSelector(isLoggedInSelector); // Use localstorage to know if logged in

  const [logout] = useLogoutMutation();

  const loginRed = () => {
    localStorage.setItem('isLoggedIn', 'false');
    history.push('/login');
    // In theory people can see this webpage as a landing if they aren't logged in
  };

  useEffect(() => {
    if (!isLoggedIn) loginRed();
  }, [dispatch, isLoggedIn, email]);

  useGetAccountQuery();

  return (
    <div className="container mx-auto">
      {isLoggedIn
        ? (
          <>
            <div className="container mx-auto">
              Welcome back
              {' '}
              <h3>{email}</h3>
            </div>
            <Link to="/contests">Contests</Link>
            <br />
            <button
              onClick={() => { logout(); }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              type="button"
            >
              Log Out
            </button>
          </>
        )
        : (
          <>
            <h3>Ball Street</h3>
            <button
              onClick={loginRed}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              type="button"
            >
              Log In
            </button>
          </>
        )}
    </div>
  );
};

export default Home;
