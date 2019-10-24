import ApiHelper from '../../helpers/apiHelper';

export const GET_DEVICES_REQUEST = 'retail/GET_DEVICES_REQUEST';
export const GET_DEVICES_SUCCESS = 'retail/GET_DEVICES_SUCCESS';
export const GET_DEVICES_FAIL = 'retail/GET_DEVICES_FAIL';
export const UPDATE_DATERANGE = 'retila/UPDATE_TS';

export const getDevices = (textSearch = '', limit = 100, customerId, userType) => dispatch => {
  dispatch({type: GET_DEVICES_REQUEST});
  let url = `/devices?limit=${limit}&textSearch=${textSearch}`;
  if (userType === 'TENANT_ADMIN') {
    url = '/tenant' + url;
  } else {
    url = '/customer/' + customerId + url;
  }

  return ApiHelper.get(url)
    .then(res => {
      let data = res.data.data;
      let devices = [];

      for (let i = 0; i < data.length; i++) {
        let additionalInfo = JSON.parse(data[i].additionalInfo.description);
        if (!additionalInfo.color) {
          additionalInfo.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
        devices[data[i].id.id] = {
          ...data[i],
          additionalInfo
        }
      }

      dispatch({
        type: GET_DEVICES_SUCCESS,
        payload: devices,
      })
    }).catch(err => {
      dispatch({
        type: GET_DEVICES_FAIL,
      });
    });
};