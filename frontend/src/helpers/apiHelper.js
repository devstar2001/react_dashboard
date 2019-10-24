import axios from 'axios';
import AuthHelper from './authHelper';
import {store} from "../redux/store";
import {REFRESH_TOKEN_SUCCESS, REFRESH_TOKEN_FAILED} from '../redux/actions/auth';
import NProgress from 'nprogress';

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  NProgress.start();
  return config;
}, function (error) {
  // Do something with request error
  NProgress.done();
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response data
  NProgress.done();
  return response;
}, function (error) {
  NProgress.done();
  // Do something with response error
  return Promise.reject(error);
});

const TB_API_URL = 'https://api.mytk.ch/api';

const withAuth = (headers = {}) => {
  return {
    ...headers,
    'x-authorization': 'Bearer ' + AuthHelper.accessToken(),
  }
};

const base = (method, url, data = {}, headers = {}, secure = true, isTBAPI = true) => {
  if (isTBAPI)
    url = TB_API_URL + url;

  if (secure) {
    let state = store.getState();
    if (AuthHelper.isAccessTokenExpired(state.auth)) {
      return axios.post(TB_API_URL + '/auth/token', {
        refreshToken: state.auth.refresh.token
      }).then(res => {
        store.dispatch({
          type: REFRESH_TOKEN_SUCCESS,
          payload: res.data
        });
        return axios({
          method,
          url,
          headers: withAuth(headers),
          data: data,
        });
      }).catch(err => {
        store.dispatch({
          type: REFRESH_TOKEN_FAILED,
        });
        throw(err);
      });
    } else {
      return axios({
        method,
        url,
        headers: withAuth(headers),
        data: data,
      });
    }
  } else {
    return axios({
      method,
      url,
      headers,
      data: data,
    });
  }
};

const ApiHelper = {};

['get', 'post', 'put', 'delete'].forEach(method => {
  ApiHelper[method] = base.bind(null, method);
});

export default ApiHelper;
