/* eslint-disable react-refresh/only-export-components -- This is core router, we don't care */
import { lazy, memo, useEffect } from 'react';
import { Navigate, Outlet, createBrowserRouter, isRouteErrorResponse, useLocation, useRouteError } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/';

import LoginPage from '@/pages/login';
import NotFoundPage from '@/pages/404';

import { IconCertificate, IconFileDescription, IconGps, IconHome, IconLock, IconServer, IconServerBolt } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

import { needLogin, NotAuthenticatedContainer } from 'sekisho';
import { useLogout, useToken } from '@/context/token';
import ZoneIndexPage from '../pages/zone/index';
import CloudflarePagesDeleteDeployments from '../pages/zone/delete-old-pages/delete-projects';

// import Layout from '@/components/layout';

// 错误页面不要预加载，首屏就要有
// import NotFoundPage from '../pages/404';
// import ForbiddenPage from '../pages/403';

// 使用 React.lazy 做代码分割
// 注意用 import(/* webpackPrefetch: true */ '@/oages/') 为所有路由都做预加载

const Homepage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/home'));
const UniversalSSLPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/zone/universal-ssl'));
const EdgeCertificatesPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/zone/ssl-verifications'));
const DNSPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/zone/dns'));
const ETagPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/zone/etag'));

const DeleteOldPages = lazy(() => import(/* webpackPrefetch: true */ '@/pages/zone/delete-old-pages'));
// const CloudflarePagesProject = lazy(() => import('@/pages/zone/delete-old-pages/__cloudflare-pages-project'));

// 自定义 ErrorBoundary
const GlobalErrorBoundary = memo(() => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) // if (error.status === 403) {
    //   return <ForbiddenPage />;
    // }
    && error.status === 404) {
    return <NotFoundPage />;
  }

  // TODO: 返回 50X？
  // TODO: 换一个全局的错误处理页面
  // return <NotFoundPage />;
  return <div />;
});

export const homeNavLinks: Array<RouteObject & {
  label: string,
  icon: Icon
}> = [
  {
    index: true,
    element: <Homepage />,
    label: 'Home',
    icon: IconHome
  },
  {
    path: 'account/delete-old-pages',
    label: 'Delete Old Pages',
    icon: IconServerBolt,
    children: [
      {
        path: '',
        element: <DeleteOldPages />,
        children: [
          {
            path: ':accountId',
            element: <CloudflarePagesDeleteDeployments />
          }
        ]
      }
      // {
      //   index: false,
      //   path: ':accountId/:projectName',
      //   element: <CloudflarePagesProjectDeployments />
      // }
    ]
  }
];

export const zoneNavLinks: Array<{
  index?: true,
  path: string,
  element: React.ReactNode,
  label: string,
  icon: Icon
}> = [
  {
    index: true,
    path: '',
    element: <ZoneIndexPage />,
    label: 'Overview',
    icon: IconFileDescription
  },
  {
    path: 'dns',
    element: <DNSPage />,
    label: 'DNS',
    icon: IconGps
  },
  {
    path: 'universal-ssl',
    element: <UniversalSSLPage />,
    label: 'Universal SSL Settings',
    icon: IconLock
  },
  {
    path: 'ssl-verifications',
    element: <EdgeCertificatesPage />,
    label: 'SSL Verifications',
    icon: IconCertificate
  },
  {
    path: 'etag',
    element: <ETagPage />,
    label: 'ETag',
    icon: IconServer
  }
];

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        element: <RedirectAlreadyLoggedIn />,
        children: [
          {
            path: 'login',
            element: <LoginPage />
          }
        ]
      },
      {
        element: <Protected />,
        children: [
          ...homeNavLinks,
          {
            path: ':zoneId/:zoneName',
            element: <Outlet />,
            children: zoneNavLinks.map(route => ({
              index: route.index,
              path: route.path,
              element: route.element
            }))
          }
        ]
      }
    ]
  },
  // {
  //   path: '/403',
  //   element: <ForbiddenPage />
  // },
  {
    path: '/404',
    element: <NotFoundPage />
  }
]);

function Protected() {
  return (
    <NotAuthenticatedContainer fallback={<LoginRedirect />}>
      <Outlet />
      <TokenGuard />
    </NotAuthenticatedContainer>
  );
}

function LoginRedirect() {
  const logout = useLogout();
  useEffect(() => {
    logout(false);
  }, [logout]);

  return null;
}

function TokenGuard() {
  const token = useToken();
  const { state, pathname } = useLocation();

  // FIXME: this is a hack to solve a race condition
  // https://github.com/remix-run/react-router/issues/10232
  // It is possible that the React Router flushes before the token state
  // (which is a React state) is set
  const tokenFromState = state?.token;

  if (process.env.NODE_ENV === 'development') {
    console.log({ _info: '<ProtectRoute />', token, pathname, state, hasNoToken: !token && !tokenFromState });
  }

  if (tokenFromState || token) {
    return null;
  }

  return needLogin('Missing API token');
}

function RedirectAlreadyLoggedIn() {
  const { state } = useLocation();
  const token = useToken();

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
