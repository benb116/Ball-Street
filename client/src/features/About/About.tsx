import React from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearState, userSelector } from '../User/User.slice';

function About() {
  const dispatch = useAppDispatch();

  const { email } = useAppSelector(userSelector);

  const onLogOut = () => {
    dispatch(clearState());
  };

  return (
    <div className="container mx-auto">
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
    </div>
  );
}

export default About;
