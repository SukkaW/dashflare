import { Outlet, useLocation } from 'react-router-dom';
import { useToken } from '../context/token';

export default function IsLoggedIn() {
  const token = useToken();
  const { pathname } = useLocation();
  console.log({ token, pathname });

  if (!token) {
    // return <Navigate to="/login" replace />;
    console.log('not logged in');
  }

  return <Outlet />;
}
