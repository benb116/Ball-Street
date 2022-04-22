import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '../../app/hooks';

import { userSelector } from './User.slice';
import { useForgotMutation } from '../../helpers/api';

const Forgot = () => {
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const { id } = useAppSelector(userSelector);

  const [forgot] = useForgotMutation();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') history.push('/');
  }, [history, id]);

  return (
    <>
      <div style={{ marginTop: '10em' }}>
        <h2>Forgot your password?</h2>
        <p>Enter your email and a password reset link will be sent to you.</p>
        <form onSubmit={handleSubmit(forgot)}>
          <input
            {...register('email')}
            id="email"
            name="email"
            type="email"
            className="AppInput"
            required
            placeholder="Email"
          />

          <button className="AppButton" type="submit">Send link</button>
        </form>
        <Link className="AppLink" to="login">Log in here</Link>
      </div>
    </>
  );
};

export default Forgot;
