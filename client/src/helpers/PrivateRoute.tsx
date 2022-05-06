import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { userSelector } from '../features/User/User.slice';

interface Props {
  component: React.ComponentType
}

const PrivateRoute: React.FC<Props> = ({ component: RouteComponent }) => {
  const user = useSelector(userSelector);

  if (user.id) {
    return <RouteComponent />;
  }

  return <Navigate to="/" />;
};

export default PrivateRoute;
