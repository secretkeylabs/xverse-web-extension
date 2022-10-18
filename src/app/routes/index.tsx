import { createHashRouter } from 'react-router-dom';
import Home from '@screens/home';
import Landing from '@screens/landing';
import Onboarding from '@screens/onboarding';
import ScreenContainer from '@components/screenContainer';
import LegalLinks from '@screens/legalLinks';
import TransactionRequest from '@screens/transactionRequest';

const router = createHashRouter([
  {
    path: '/',
    element: <ScreenContainer />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'onboarding',
        element: <Onboarding />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'legal',
        element: <LegalLinks />,
      },
      {
        path: 'transactionRequest',
        element: <TransactionRequest />,
      },
    ],
  },
]);

export default router;
