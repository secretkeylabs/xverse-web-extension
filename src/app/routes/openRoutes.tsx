import { type RouteObject } from 'react-router-dom';

import CreateWalletSuccess from '@screens/createWalletSuccess';
import ForgotPassword from '@screens/forgotPassword';
import Landing from '@screens/landing';
import Login from '@screens/login';
import WalletExists from '@screens/walletExists';

// any open routes should be placed here
// these are routes that don't require authentication and don't fit in the other routers
const openRoutes: RouteObject[] = [
  {
    path: 'landing',
    element: <Landing />,
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'forgotPassword',
    element: <ForgotPassword />,
  },
  {
    path: 'wallet-success/:action',
    element: <CreateWalletSuccess />,
  },
  {
    path: 'wallet-exists',
    element: <WalletExists />,
  },
];

export default openRoutes;
