import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SekishoProvider } from 'sekisho';
import { useToken } from '../context/token';

declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test'
  }
};

export function SekishoRouteGuard() {
  const navigate = useNavigate();
  return (
    <SekishoProvider onNeedLogin={() => navigate('/login', { replace: true })}>
      <Outlet />
    </SekishoProvider>
  );
}

export function RedirectAlreadyLoggedIn() {
  const { state } = useLocation();
  const token = useToken();

  if (process.env.NODE_ENV === 'development') {
    console.log({ _info: '<RedirectAlreadyLoggedIn />', token, state });
  }

  if (state?.logout) {
    // FIXME: this is a hack to solve a race condition
    // https://github.com/remix-run/react-router/issues/10232
    // It is possible that the React Router flushes before the token state
    // (which is a React state) has been set to null
    return <Outlet />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
