import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';

import { router } from './router';
import { MantineProviderWithDarkMode } from './context/darkmode';
import { DataFetchingProvider } from './context/data-fetching';

declare global {
  const process: {
    env: {
      NODE_ENV: 'development' | 'production',
      [key: string]: string
    }
  };
}

const app = (
  <StrictMode>
    <MantineProviderWithDarkMode>
      <DataFetchingProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </DataFetchingProvider>
      <Notifications />
    </MantineProviderWithDarkMode>
  </StrictMode>
);

const el = document.getElementById('app');
if (el) {
  createRoot(el).render(app);
}
