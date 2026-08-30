import type { RouteObject } from 'react-router-dom';
import { PublicProfilePage } from '@pages/public-profile/PublicProfilePage';

/**
 * The visitor-facing portfolio at /:username — the link the whole product
 * promises. React Router ranks static segments above dynamic ones, so /login,
 * /dashboard, etc. still win over this catch-one-segment route; reserved
 * usernames are additionally rejected by the API. Kept last (before the 404
 * wildcard) so it never shadows a real page.
 */
export const publicProfileRoutes: RouteObject[] = [
  {
    path: '/:username',
    element: <PublicProfilePage />,
  },
];
