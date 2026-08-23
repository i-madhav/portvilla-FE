import type { RouteObject } from 'react-router-dom';
import App from '@app/App';
import SceneLoader from '@app/components/SceneLoader';

export const publicRoutes: RouteObject[] = [
  {
    // App is the provider shell. SceneLoader owns the immersive landing sequence.
    element: <App />,
    children: [
      {
        index: true,
        element: <SceneLoader />,
      },
    ],
  },
];
