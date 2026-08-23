import { Outlet } from 'react-router-dom';

/** Public-route layout. Application-wide providers live once in main.tsx. */
export default function App() {
  return <Outlet />;
}
