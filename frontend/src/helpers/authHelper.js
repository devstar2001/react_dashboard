import {store} from '../redux/store';
import ApiHelper from './apiHelper';

class AuthHelper {
  login = userInfo => {
    return ApiHelper.post('/auth/login', userInfo, {}, false);
  }

  getUserInfo = () => {
    return ApiHelper.get('/auth/user');
  }

  changePassword = (currentPassword, newPassword) => {
    return ApiHelper.post('/auth/changePassword', { currentPassword, newPassword});
  }

  accessToken = () => {
    let state = store.getState();
    if (state.auth.access) {
      return state.auth.access.token;
    }
    return null;
  }

  isAccessTokenExpired = state => {
    if (state.access && state.access.exp) {
      return 1000 * state.access.exp - (new Date()).getTime() < 5000;
    }
    return true;
  }

  isRefreshTokenExpired = state => {
    if (state.refresh && state.refresh.exp) {
      return 1000 * state.refresh.exp - (new Date()).getTime() < 5000;
    }
    return true;
  }

  isAuthenticated = state => {
    return !this.isRefreshTokenExpired(state);
  }


}

export default new AuthHelper();

