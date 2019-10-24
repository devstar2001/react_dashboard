import storage from 'redux-persist/es/storage';
import {applyMiddleware, createStore, compose} from 'redux';
import {createFilter} from 'redux-persist-transform-filter';
import {persistReducer, persistStore} from 'redux-persist';
import {routerMiddleware} from 'react-router-redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();

const persistedFilter = createFilter('auth', ['access', 'refresh']);

const reducer = persistReducer(
  {
    key: 'polls',
    storage: storage,
    whitelist: ['auth'],
    transforms: [persistedFilter]
  }, rootReducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  reducer, {},
  composeEnhancers(applyMiddleware(thunk, routerMiddleware(history))));

export const persistor = persistStore(store);

