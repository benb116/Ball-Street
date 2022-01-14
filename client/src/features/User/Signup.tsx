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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(signup)} method="POST">
              <div>
                <span>
                  Name
                </span>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    required
                  />
                </div>
              </div>
              <div>
                <span>
                  Email address
                </span>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    required
                  />
                </div>
              </div>
              <div>
                <span>
                  Password
                </span>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    required
                  />
                </div>
              </div>
              <div>
                <span>
                  Skip verification?
                </span>
                <div className="mt-1">
                  <input
                    id="skipVerification"
                    type="checkbox"
                    {...register('skipVerification')}
                  />
                </div>
              </div>
              <div>
                <button type="submit">
                  <p> Sign up</p>
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or
                    <Link to="login"> Login</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
