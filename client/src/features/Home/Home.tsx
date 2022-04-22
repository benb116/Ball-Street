import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../app/hooks';

import { useGetAccountQuery, useLogoutMutation } from '../../helpers/api';
import { isLoggedInSelector, userSelector } from '../User/User.slice';

const Home = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { email, cash, name } = useAppSelector(userSelector);
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
    <div>
      {isLoggedIn
        ? (
          <>
            <div style={{ marginTop: '10em' }}>
              <h2>
                Welcome back,
                {' '}
                {name}
              </h2>
              <p>
                Account balance: $
                {cash / 100}
              </p>
            </div>
            <Link className="AppLink" to="/account">Account</Link>
            <Link className="AppLink" to="/contests">Contests</Link>
            <button onClick={() => { logout(); }} className="AppButton" type="button">
              Log Out
            </button>
          </>
        )
        : (
          <>
            <button onClick={() => { loginRed(); }} className="AppButton" type="button">
              Log in
            </button>
          </>
        )}
    </div>
  );
};

export default Home;
