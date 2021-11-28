import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAccount, isLoggedInSelector, logoutUser, userSelector,
} from '../User/UserSlice';

const Home = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { email } = useSelector(userSelector);
  const isLoggedIn = useSelector(isLoggedInSelector);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getAccount());
    }
  }, [dispatch, isLoggedIn]);

  const loginRed = () => {
    localStorage.setItem('isLoggedIn', false);
    history.push('/login');
    // In theory people can see this webpage as a landing if they aren't logged in
  };

  const onLogOut = () => {
    dispatch(logoutUser());
    loginRed();
  };

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
              onClick={onLogOut}
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
