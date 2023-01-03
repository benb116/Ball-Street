import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { userSelector } from '../features/User/User.slice';

interface Props {
  component: React.ComponentType
}

function PrivateRoute(props: Props) {
  const user = useSelector(userSelector);

  if (user.id) {
    const { component } = props;
    const RouteComponent = component;
    return <RouteComponent />;
  }

  return <Navigate to="/" />;
}

export default PrivateRoute;
