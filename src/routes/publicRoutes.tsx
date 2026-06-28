import type { RouteObject } from 'react-router-dom';
import App from '@app/App';
import SceneLoader from '@app/components/SceneLoader';

export const publicRoutes: RouteObject[] = [
  {
    // App is the provider shell. SceneLoader is the landing page.
    element: <App />,
    children: [
      {
        index: true,
        element: <SceneLoader />,
      },
    ],
  },
];
