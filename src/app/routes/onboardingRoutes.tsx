import OnboardingGuard from '@components/guards/onboarding';
import { Outlet, type RouteObject } from 'react-router-dom';

import BackupWallet from '@screens/backupWallet';
import BackupWalletSteps from '@screens/backupWalletSteps';
import CreatePassword from '@screens/createPassword';
import Legal from '@screens/legal';
import RestoreWallet from '@screens/restoreWallet';

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
      path: 'backup',
      element: <BackupWallet />,
    },
    {
      path: 'legal',
      element: <Legal />,
    },
    {
      path: 'restoreWallet',
      element: <RestoreWallet />,
    },
    {
      path: 'backupWalletSteps',
      element: <BackupWalletSteps />,
    },
    {
      path: 'create-password',
      element: <CreatePassword />,
    },
  ],
};

export default onboardingRoutes;
