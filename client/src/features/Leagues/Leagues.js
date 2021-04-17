import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Link } from "react-router-dom";

import { leaguesSelector, getUserLeagues, getPublicLeagues, createLeague } from './LeaguesSlice';

const Leagues = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const { userLeagues, publicLeagues } = useSelector(leaguesSelector);

  const pullLeagues = () => {
    dispatch(getUserLeagues());
    dispatch(getPublicLeagues());
  };

  useEffect(pullLeagues, [dispatch]);

  const onSubmit = (data) => {
    dispatch(createLeague(data));
  };

  return (
    <div className="container mx-auto">
      <Fragment>
        <div className="container mx-auto">

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} method="POST" >
              <div>
                <label
                  htmlFor="LeagueName"
                  className="block text-sm font-medium text-gray-700"
                >
                  League Name
                </label>
                <div className="mt-1">
                  <input
                    {...register('name')}
                    id="name"
                    name="name"
                    type="name"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Budget
                </label>
                <div className="mt-1">
                  <input
                    {...register('budget')}
                    id="budget"
                    name="budget"
                    type="budget"
                    autoComplete="current-budget"
                    defaultValue="10000"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create private league
                </button>
              </div>
            </form>

          <br/>
          My private leagues
          <br/>
          <ul>
            {userLeagues.map(function(league, index){
              return <LeagueItem key={ index } leaguedata={ league }/>;
            })}
          </ul>
          <br/>
          My public leagues
          <br/>
          <ul>
            {publicLeagues.map(function(league, index){
              return <LeagueItem key={ index } leaguedata={ league }/>;
            })}
          </ul>
        </div>
      </Fragment>
    </div>
  );
};

function LeagueItem(props) {
  return (
    <li>
      <Link to={`/leagues/${props.leaguedata.id}`}>
        {props.leaguedata.name} - {props.leaguedata.budget}
      </Link>
    </li>
  );
}

export default Leagues;
