import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { leagueSelector, leagueContestsSelector, leagueMembersSelector, getLeague, getLeagueMembers, addMember, getContests, createContest } from './LeaguesSlice';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";

const Leagues = () => {
  const { leagueID } = useParams();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    dispatch(getLeague(leagueID));
    dispatch(getLeagueMembers(leagueID));
    dispatch(getContests(leagueID));
  }, [dispatch, leagueID]);

  const thisLeague = useSelector(leagueSelector);
  const thisLeagueContests = useSelector(leagueContestsSelector);
  const thisLeagueMembers = useSelector(leagueMembersSelector);

  const onCreateContest = (data) => {
    dispatch(createContest({leagueID: leagueID, name: data.name}));
  };

  const onAddUser = (data) => {
    console.log(data);
    dispatch(addMember({leagueID: leagueID, email: data.email}));
  };

  return (
    <div className="container mx-auto">
      <Fragment>
        <div className="container mx-auto">

          <span>League info</span>
          <br/>
          {JSON.stringify(thisLeague)}
          <br/>
          <br/>
          League Contests
          <br/>
          <ul>
            {thisLeagueContests.map(function(contest, index){
              return <ContestItem key={ index } leagueID={leagueID} contestdata={ contest }/>;
            })}
          </ul>
          <br/>
          <br/>
          {JSON.stringify(thisLeagueMembers)}
          <br/>

          <form className="space-y-6" onSubmit={handleSubmit(onCreateContest)} method="POST" >
            <div>
              <label
                htmlFor="ContestName"
                className="block text-sm font-medium text-gray-700"
              >
                Contest Name
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
                Create contest
              </button>
            </div>
          </form>

          <br/>
          <br/>

          <form className="space-y-6" onSubmit={handleSubmit(onAddUser)} method="POST" >
            <div>
              <label
                htmlFor="UserName"
                className="block text-sm font-medium text-gray-700"
              >
                User email
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                Add user as member
              </button>
            </div>
          </form>

        </div>
      </Fragment>
    </div>
  );
};

function ContestItem(props) {
  return (
    <li>
      <Link to={`/leagues/${props.leagueID}/contests/${props.contestdata.id}`}>
        {props.contestdata.name} - {props.contestdata.nflweek}
      </Link>
    </li>
  );
}

export default Leagues;
