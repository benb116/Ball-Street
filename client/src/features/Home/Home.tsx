import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAppSelector } from '@app/hooks';

import { useGetAccountQuery, useLogoutMutation } from '../User/User.api';
import { userSelector } from '../User/User.slice';

function Home() {
  const { id, cash, name } = useAppSelector(userSelector);

  const [logout] = useLogoutMutation();

  useGetAccountQuery();

  return (
    <div>
      {id
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
          <Navigate to="/login" />
        )}
    </div>
  );
}

export default Home;
