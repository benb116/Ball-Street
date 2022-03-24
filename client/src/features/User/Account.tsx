import React from 'react';

import { useAppSelector } from '../../app/hooks';

import { useLogoutMutation } from '../../helpers/api';
import { userSelector } from './User.slice';

const Account = () => {
  const { email } = useAppSelector(userSelector);

  const [logout] = useLogoutMutation();

  return (
    <div className="container mx-auto">
      <>
        <div className="container mx-auto">
          Welcome back
          {' '}
          <h3>{email}</h3>
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
