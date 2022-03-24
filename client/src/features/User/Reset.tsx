import React, { useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '../../app/hooks';

import { userSelector } from './User.slice';
import { useResetMutation } from '../../helpers/api';

const Reset = () => {
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit } = useForm();
  const history = useHistory();
  const { id } = useAppSelector(userSelector);

  const [reset] = useResetMutation();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') history.push('/');
  }, [history, id]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(reset)} method="POST">
              <div>
                <span>
                  Password
                </span>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    required
                  />
                </div>
              </div>
              <div>
                <span>
                  Confirm password
                </span>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="mt-1">
                  <input
                    id="token"
                    type="token"
                    {...register('token')}
                    value={token}
                    hidden
                  />
                </div>
              </div>
              <div>
                <button type="submit">
                  <p> Submit</p>
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or
                    <Link to="/login"> Login</Link>
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

export default Reset;
