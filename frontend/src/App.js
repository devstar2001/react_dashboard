import React from 'react';
import {Provider} from 'react-redux';
import {history, store, persistor} from './redux/store';
import {PersistGate} from 'redux-persist/integration/react'
import {ConnectedRouter} from 'react-router-redux';
import {Route, Switch} from 'react-router-dom';
import PrivateRoute from "./components/PrivateRoute";
import ReduxToastr from 'react-redux-toastr'
import Loadable from 'react-loadable';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import './App.scss';


const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

const Login = Loadable({
  loader: () => import('./containers/Login'),
  loading
});

const Layout = Loadable({
  loader: () => import('./containers/Layout'),
  loading
});

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConnectedRouter history={history}>
      <React.Fragment>
        <Switch>
          <Route exact path="/login/" component={Login}/>
          <PrivateRoute path="/" component={Layout}/>
        </Switch>
        <ReduxToastr timeOut={3000} transitionIn="fadeIn" transitionOut="fadeOut"/>
      </React.Fragment>
    </ConnectedRouter>
    </PersistGate>
  </Provider>
);

export default App;
