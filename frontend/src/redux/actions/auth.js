import AuthHelper from '../../helpers/authHelper';
import {toastr} from "react-redux-toastr";

export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';
export const LOGOUT = 'auth/LOGOUT';
export const REFRESH_TOKEN_REQUEST = 'auth/REFRESH_TOKEN_REQUEST';
export const REFRESH_TOKEN_SUCCESS = 'auth/REFRESH_TOKEN_SUCCESS';
export const REFRESH_TOKEN_FAILED = 'auth/REFRESH_TOKEN_FAILED';
export const GET_USER_INFO_REQUEST = 'auth/GET_USER_INFO_REQUEST';
export const GET_USER_INFO_SUCCESS = 'auth/GET_USER_INFO_SUCCESS';
export const GET_USER_INFO_FAILURE = 'auth/GET_USER_INFO_FAILURE';
export const UPDATE_USER_INFO = 'auth/UPDATE_USER_INFO';

export const login = userInfo => dispatch => {
  dispatch({type: LOGIN_REQUEST});
  return AuthHelper.login(userInfo)
    .then(res => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      });
    }).catch(err => {
      toastr.error("Login Failed!", err.response.data.message);
      dispatch({
        type: LOGIN_FAILURE,
      });
    });
};

export const logout = () => {
  return {
    type: LOGOUT
  }
};

export const getUserInfo = () => dispatch => {
  dispatch({type: GET_USER_INFO_REQUEST});
  return AuthHelper.getUserInfo()
    .then(res => {
      dispatch({
        type: GET_USER_INFO_SUCCESS,
        payload: res.data
      });
    }).catch(err => {
      dispatch({
        type: GET_USER_INFO_FAILURE,
      });
    });
};

export const updateUserInfo = user => {
  return {
    type: UPDATE_USER_INFO,
    payload: user,
  }
};