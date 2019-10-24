import requests
import logging
from .settings import TB_URL, TB_USER_NAME, TB_USER_PASSWORD

logger = logging.getLogger(__name__)


class TBAPI:

    def __init__(self):
        self.token = ''
        self.get_auth_token()

    def get_auth_token(self):
        response = requests.post(TB_URL + '/api/auth/login',
                                 json={'username': TB_USER_NAME, 'password': TB_USER_PASSWORD})
        if response.status_code == 200:
            self.token = 'Bearer ' + response.json()['token']
        else:
            logger.error('TB login failed.')
            self.token = ''

    def get_device_credentials(self, device_id):
        url = '{}/api/device/{}/credentials'.format(TB_URL, device_id)
        response = requests.get(url, headers={'X-Authorization': self.token})

        if response.status_code == 200:
            return response.json()
        if response.status_code == 404:
            return None

