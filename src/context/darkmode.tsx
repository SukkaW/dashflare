import { useLocalStorage } from '@mantine/hooks';
import type { ColorScheme } from '@mantine/core';
import { MantineProvider, ColorSchemeProvider, createEmotionCache } from '@mantine/core';
import { useCallback } from 'react';

const emotionCache = createEmotionCache({
  key: 'sukka'
});

export function MantineProviderWithDarkMode({ children }: React.PropsWithChildren) {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'user-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: false
  });

  const toggleColorScheme = useCallback((value?: ColorScheme) => setColorScheme(prevColorScheme => value || (prevColorScheme === 'dark' ? 'light' : 'dark')), [setColorScheme]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{
          fontFamily: '-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Source Han Sans SC,Noto Sans CJK SC,Microsoft YaHei,WenQuanYi Micro Hei,WenQuanYi Zen Hei,Helvetica Neue,Arial,sans-serif',
          colorScheme
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
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
