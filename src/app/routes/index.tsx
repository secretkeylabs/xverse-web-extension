import AnimatedScreenContainer from '@components/animatedScreenContainer';
import ScreenContainer from '@components/screenContainer';
import ErrorBoundary from '@screens/error';
import { createHashRouter } from 'react-router-dom';

import { authedRoutes, authedRoutesAnimated, authedRoutesWithSidebar } from './authenticatedRoutes';
import onboardingRoutes from './onboardingRoutes';
import openRoutes from './openRoutes';

const router = createHashRouter([
  {
    path: '/',
    element: <ScreenContainer />,
    errorElement: <ErrorBoundary />,
    children: [authedRoutes, onboardingRoutes, ...openRoutes],
  },
  {
    path: '/',
    element: <AnimatedScreenContainer />,
    errorElement: <ErrorBoundary />,
    children: [authedRoutesAnimated],
  },
  {
    path: '/',
    element: <ScreenContainer isSidebarVisible />,
    errorElement: <ErrorBoundary />,
    children: [authedRoutesWithSidebar],
  },
]);

export default router;
