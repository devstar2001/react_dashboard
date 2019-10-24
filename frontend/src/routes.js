import React from 'react';
import Layout from './containers/Layout';

const Dashboard = React.lazy(() => import('./apps/retail/Dashboard'));
const Profile = React.lazy(() => import('./containers/Profile'));

const routes = [
  { path: '/', exact: true, name: 'Home', component: Layout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/profile', name: 'Profile', component: Profile },
];

export default routes;

