import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from 'react-loader-spinner';
import { useHistory } from 'react-router-dom';
import { userSelector, clearState } from './UserSlice';

const Account = () => {
  const history = useHistory();

  const dispatch = useDispatch();
  const { isFetching, isError } = useSelector(userSelector);

  const { email } = useSelector(userSelector);

  useEffect(() => {
    if (isError) {
      dispatch(clearState());
      history.push('/login');
    }
  }, [dispatch, history, isError]);

  const onLogOut = () => {
    history.push('/login');
  };

  return (
    <div className="container mx-auto">
      {isFetching ? (
        <Loader type="Puff" color="#00BFFF" height={100} width={100} />
      ) : (
        <>
          <div className="container mx-auto">
            Welcome back
            {' '}
            <h3>{email}</h3>
          </div>

          <button
            onClick={onLogOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Log Out
          </button>
        </>
      )}
    </div>
  );
};

export default Account;
