import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useToken } from '../context/token';

declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test'
  }
};

export function ProtectRoute() {
  const token = useToken();
  const { state, pathname } = useLocation();

  // FIXME: this is a hack to solve a race condition
  // https://github.com/remix-run/react-router/issues/10232
  // It is possible that the React Router flushes before the token state
  // (which is a React state) is set
  const tokenFromState = state?.token;

  if (process.env.NODE_ENV === 'development') {
    console.log({ _info: '<ProtectRoute />', token, pathname, state, hasNoToken: !(token || tokenFromState) });
  }

  if (tokenFromState || token) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
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
