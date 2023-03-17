import { Box, createEmotionCache, MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';

import { router } from './router';

const emotionCache = createEmotionCache({
  key: 'sukka'
});

export default function App() {
  return (
    <StrictMode>
      <MantineProvider
        theme={{
          fontFamily: '-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Source Han Sans SC,Noto Sans CJK SC,Microsoft YaHei,WenQuanYi Micro Hei,WenQuanYi Zen Hei,Helvetica Neue,Arial,sans-serif'
          // colors: {
          //   primary: ['#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF', '#006FFF']
          // },
          // primaryColor: 'primary',
          // defaultGradient: {
          //   from: 'rgba(40, 100, 251, 1) 0%',
          //   to: 'rgba(64, 163, 253, 1) 100%',
          //   deg: 270
          // },
          // other: {
          //   defaultGradient: 'linear-gradient(270deg, rgba(40, 100, 251, 1) 0%, rgba(64, 163, 253, 1) 100%)'
          // }
        }}
        emotionCache={emotionCache}
        withNormalizeCSS
        withGlobalStyles
      >
        <Box id="app-root" w="100vw" h="100vh" sx={{ overflow: 'hidden', position: 'relative' }} m={0} p={0}>
          <RouterProvider router={router} />
        </Box>
        <Notifications />
      </MantineProvider>
    </StrictMode>
  );
}
