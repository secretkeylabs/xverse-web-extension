import OnboardingGuard from '@components/guards/onboarding';
import { Outlet, type RouteObject } from 'react-router-dom';

import CreateWallet from '@screens/createWallet';
import Legal from '@screens/legal';
import RestoreWallet from '@screens/restoreWallet';
import RoutePaths from './paths';

const onboardingRoutes: RouteObject = {
  path: '/',
  element: (
    <OnboardingGuard>
      <Outlet />
    </OnboardingGuard>
  ),
  children: [
    // all onboarding routes should be placed here
    {
      path: RoutePaths.Legal,
      element: <Legal />,
    },
    {
      path: RoutePaths.RestoreWallet,
      element: <RestoreWallet />,
    },
    {
      path: RoutePaths.CreateWallet,
      element: <CreateWallet />,
    },
  ],
};

export default onboardingRoutes;
