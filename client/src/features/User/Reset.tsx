import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useResetMutation } from './User.api';
import { ResetInputType } from './User.types';

const Reset = () => {
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit } = useForm<ResetInputType>();

  const [reset] = useResetMutation();

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
