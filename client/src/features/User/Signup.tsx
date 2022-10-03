import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useSignupMutation } from './User.api';
import { SignupInputType } from './User.types';
import { userSelector } from './User.slice';
import { useAppSelector } from '@app/hooks';

function Signup() {
  const { register, handleSubmit } = useForm<SignupInputType>();
  const { id } = useAppSelector(userSelector);

  const [signup] = useSignupMutation();

  if (id) return <Navigate to="/" />;

  return (
    <div style={{ marginTop: '10em' }}>
      <h2>Sign up for an account</h2>
      <form onSubmit={handleSubmit(signup)}>
        <input
          {...register('name')}
          id="name"
          type="text"
          autoComplete="name"
          className="AppInput"
          required
          placeholder="Name"
        />

        <input
          {...register('email')}
          id="email"
          type="email"
          className="AppInput"
          required
          placeholder="Email"
        />

        <input
          {...register('password')}
          id="password"
          type="password"
          className="AppInput"
          autoComplete="current-password"
          required
          placeholder="Password"
        />

        Skip verification?
        <input
          id="skipVerification"
          type="checkbox"
          {...register('skipVerification')}
        />
        <button className="AppButton" type="submit">Sign up</button>
      </form>

      <Link className="AppLink" to="/login">Log in here</Link>
    </div>
  );
}

export default Signup;
