import { createMemoryRouter } from 'react-router-dom';
import Home from '../screens/home';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Home />,
  },
]);

export default router;
