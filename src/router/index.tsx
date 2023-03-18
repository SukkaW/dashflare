// import { lazy } from 'react';
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import Layout from '@/components/layout/';

import LoginPage from '@/pages/login';

import { NotFoundPage } from '../pages/404';
import { lazy } from 'react';
import ZoneIdPage from '../pages/zone-id';

// import Layout from '@/components/layout';

// 错误页面不要预加载，首屏就要有
// import NotFoundPage from '../pages/404';
// import ForbiddenPage from '../pages/403';

// 使用 React.lazy 做代码分割
// 注意用 import(/* webpackPrefetch: true */ '@/oages/') 为所有路由都做预加载

const Homepage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/home'));
const SSLPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/ssl'));

// 自定义 ErrorBoundary
const ErrorBoundary = () => {
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
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Homepage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: ':zoneId',
        element: <ZoneIdPage />,
        children: [
          {
            path: 'ssl',
            element: <SSLPage />
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
