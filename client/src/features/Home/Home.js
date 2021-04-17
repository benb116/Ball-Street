import React, { Fragment, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getAccount, isLoggedInSelector, logoutUser, userSelector } from '../User/UserSlice';
import { useHistory } from 'react-router-dom';

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

  const onLogOut = () => {
    dispatch(logoutUser());
    loginRed();
  };

  const loginRed = () => {
    localStorage.setItem('isLoggedIn', false);
    history.push('/login');
    // In theory people can see this webpage as a landing if they aren't logged in
  };

  return (
    <div className="container mx-auto">
        {isLoggedIn ? 
          <Fragment>
            <div className="container mx-auto">
              Welcome back <h3>{email}</h3>
            </div>
            <Link to="/leagues">Leagues</Link>
            <br/>
            <button
              onClick={onLogOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Log Out
            </button>
          </Fragment>
        :
          <Fragment>
            <h3>Ball Street</h3>
            <button
              onClick={loginRed}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          </Fragment>
        }
    </div>
  );
};

export default Home;
