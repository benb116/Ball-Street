import React, { useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '../../app/hooks';

import { userSelector } from './User.slice';
import { useResetMutation } from './User.api';
import { ResetInputType } from './User.types';

const Reset = () => {
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit } = useForm<ResetInputType>();
  const history = useHistory();
  const { id } = useAppSelector(userSelector);

  const [reset] = useResetMutation();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') history.push('/');
  }, [history, id]);

  return (
    <>
      <div style={{ marginTop: '10em' }}>
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit(reset)}>
          <input
            {...register('password')}
            id="password"
            name="password"
            type="password"
            className="AppInput"
            required
            placeholder="Password"
          />

          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="AppInput"
            required
            placeholder="Confirm Password"
          />

          <input
            id="token"
            type="token"
            {...register('token')}
            value={token}
            hidden
          />

          <button className="AppButton" type="submit">Reset</button>
        </form>
        <Link className="AppLink" to="/login">Log in here</Link>
      </div>
    </>
  );
};

export default Reset;
