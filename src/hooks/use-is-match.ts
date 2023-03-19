import { useContext, useMemo } from 'react';
import { UNSAFE_NavigationContext, useLocation, useResolvedPath } from 'react-router-dom';

export const useIsMatch = (to: string) => {
  const { navigator: { encodeLocation } } = useContext(UNSAFE_NavigationContext);
  const { pathname } = useLocation();
  const path = useResolvedPath(to);

  return useMemo(() => {
    const toPathname = encodeLocation
      ? encodeLocation(path).pathname
      : path.pathname;

    return (
      pathname === toPathname
        || (
          pathname.startsWith(toPathname)
        && pathname.charAt(toPathname.length) === '/'
        )
    );
  }, [encodeLocation, path, pathname]);
};
