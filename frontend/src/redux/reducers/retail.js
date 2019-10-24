import * as retail from '../actions/retail';

const initialState = {
  isFetching: false,
  devices: [],
  startDate: null,
  endDate: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case retail.GET_DEVICES_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case retail.GET_DEVICES_SUCCESS:
      return {
        ...state,
        devices: action.payload,
        isFetching: false,
      };

    case retail.GET_DEVICES_FAIL:
      return {
        ...state,
        devices: [],
        isFetching: false,
      };
    case retail.UPDATE_DATERANGE:
      return {
        ...state,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
      };

    default:
      return state
  }
}