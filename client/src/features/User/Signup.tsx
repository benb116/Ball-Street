import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '../../app/hooks';

import { userSelector } from './User.slice';
import { useSignupMutation } from '../../helpers/api';

const Signup = () => {
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const { id } = useAppSelector(userSelector);
  const [signup] = useSignupMutation();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      history.push('/');
    }
  }, [history, id]);

  return (
    <>
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

        <Link className="AppLink" to="login">Log in here</Link>
      </div>
    </>
  );
};

export default Signup;
