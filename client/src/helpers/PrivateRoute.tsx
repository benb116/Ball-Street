import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({ component, ...rest }: any) => {
  const routeComponent = (props: any) => (
    (localStorage.getItem('isLoggedIn') === 'true')
      ? React.createElement(component, props)
      : <Redirect to={{ pathname: '/login' }} />
  );
  return <Route {...rest} render={routeComponent} />;
};

export default PrivateRoute;
