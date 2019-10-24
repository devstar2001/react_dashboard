import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import {reducer as toastr} from 'react-redux-toastr';
import auth from './auth';
import retail from './retail';

export default combineReducers({
  router: routerReducer,
  auth,
  retail,
  toastr,
});
