import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <Route
      {...rest}
      render={props =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
