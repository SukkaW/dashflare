import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';

import { router } from './router';
import { MantineProviderWithDarkMode } from './context/darkmode';
import { TokenProvider } from './context/token';

export default function App() {
  return (
    <StrictMode>
      <MantineProviderWithDarkMode>
        <TokenProvider>
          <RouterProvider router={router} />
        </TokenProvider>
        <Notifications />
      </MantineProviderWithDarkMode>
    </StrictMode>
  );
}
