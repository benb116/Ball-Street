import React, { ComponentClass, FunctionComponent } from 'react';
import { Redirect, Route } from 'react-router-dom';

type ComponentType = string | FunctionComponent | ComponentClass;

const PrivateRoute = ({ component, ...rest }: { component: ComponentType, exact: boolean, path: string }) => {
  const routeComponent = () => (
    (localStorage.getItem('isLoggedIn') === 'true')
      ? React.createElement(component)
      : <Redirect to={{ pathname: '/login' }} />
  );
  return <Route {...rest} render={routeComponent} />;
};

export default PrivateRoute;
