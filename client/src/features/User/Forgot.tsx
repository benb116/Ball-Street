import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useForgotMutation } from './User.api';
import { ForgotType } from './User.types';

const Forgot = () => {
  const { register, handleSubmit } = useForm<ForgotType>();

  const [forgot] = useForgotMutation();

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
        <Link className="AppLink" to="/login">Log in here</Link>
      </div>
    </>
  );
};

export default Forgot;
