import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '../../app/hooks';

import { userSelector } from './User.slice';
import { useLoginMutation } from './User.api';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const { id } = useAppSelector(userSelector);

  const [login] = useLoginMutation();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      history.push('/');
    }
  }, [history, id]);

  return (
    <>
      <div style={{ marginTop: '10em' }}>
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit(login)}>
          <input
            {...register('email')}
            id="email"
            name="email"
            type="email"
            className="AppInput"
            required
            placeholder="Email"
          />

          <input
            {...register('password')}
            id="password"
            name="password"
            type="password"
            className="AppInput"
            autoComplete="current-password"
            required
            placeholder="Password"
          />

          <button className="AppButton" type="submit">Sign in</button>
        </form>
        <Link className="AppLink" to="forgot"> Forgot password?</Link>

        <Link className="AppLink" to="signup">Signup here</Link>
      </div>
    </>
  );
};

export default Login;
