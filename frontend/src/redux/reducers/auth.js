import jwtDecode from 'jwt-decode';
import * as auth from '../actions/auth';

const initialState = {
  isFetching: false,
  access: undefined,
  refresh: undefined,
  user: undefined,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case auth.LOGIN_SUCCESS:
    case auth.REFRESH_TOKEN_SUCCESS:
      let data = jwtDecode(action.payload.token);
      return {
        access: {
          token: action.payload.token,
          ...data
        },
        refresh: {
          token: action.payload.refreshToken,
          ...jwtDecode(action.payload.refreshToken)
        },
        isFetching: false,
      };

    case auth.GET_USER_INFO_SUCCESS:
    case auth.UPDATE_USER_INFO:
      return {
        ...state,
        user: action.payload
      };

    case auth.LOGIN_REQUEST:
    case auth.REFRESH_TOKEN_REQUEST:
    case auth.GET_USER_INFO_REQUEST:
      return {
        ...state,
        isFetching: true,
      };

    case auth.REFRESH_TOKEN_FAILED:
    case auth.LOGIN_FAILURE:
    case auth.LOGOUT:
    case auth.GET_USER_INFO_FAILURE:
      return initialState;

    default:
      return state
  }
}