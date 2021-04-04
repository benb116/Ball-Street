import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAccount, logoutUser, userSelector, statusSelector } from '../User/UserSlice';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { id, name, email } = useSelector(userSelector);
  const { isFetching, isSuccess, isError, errorMessage } = useSelector(statusSelector);

  useEffect(() => {
    console.log(Date.now());
    console.log(isError, isSuccess);
    if (isError) {
      console.log('e');
    } else {
      dispatch(getAccount(null));
    }

    if (isSuccess) {
      console.log('s');
    }
  }, [isError, isSuccess]);  

  const onLogOut = () => {
    dispatch(logoutUser());
    history.push('/login');
  };

  return (
    <div className="container mx-auto">
        <Fragment>
          <div className="container mx-auto">
            Welcome back <h3>{email}</h3>
          </div>

          <button
            onClick={onLogOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Log Out
          </button>
        </Fragment>
    </div>
  );
};

export default Home;
