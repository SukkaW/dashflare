import { lazy, memo } from 'react';
import { Outlet, createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import Layout from '@/components/layout/';

import LoginPage from '@/pages/login';
import NotFoundPage from '@/pages/404';

import { IconCertificate, IconFileDescription, IconGps, IconLock } from '@tabler/icons-react';
import { ProtectRoute, RedirectAlreadyLoggedIn } from '@/components/checked-logged-in';
import ZoneIndexPage from '../pages/zone/index';

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

// 自定义 ErrorBoundary
const ErrorBoundary = memo(() => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    // if (error.status === 403) {
    //   return <ForbiddenPage />;
    // }
    if (error.status === 404) {
      return <NotFoundPage />;
    }
    // TODO: 返回 50X？
  }
  // TODO: 换一个全局的错误处理页面
  // return <NotFoundPage />;
  return <div />;
});

export const navLinks = [
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
  }
];

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorBoundary />,
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
        element: <ProtectRoute />,
        children: [
          {
            index: true,
            element: <Homepage />
          },
          {
            path: ':zoneId/:zoneName',
            element: <Outlet />,
            children: navLinks.map(route => ({
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
