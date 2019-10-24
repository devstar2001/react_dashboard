import React from 'react';
import {Route, Redirect} from 'react-router';
import {connect} from 'react-redux';
import AuthHelper from "../helpers/authHelper";

const PrivateRoute = ({component: Component, isAuthenticated, ...rest}) => (
  <Route {...rest} render={props => (
    isAuthenticated ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: {from: props.location}
      }}/>
    )
  )}/>
);

const mapStateToProps = (state) => ({
  isAuthenticated: AuthHelper.isAuthenticated(state.auth),
});

export default connect(mapStateToProps, null)(PrivateRoute);