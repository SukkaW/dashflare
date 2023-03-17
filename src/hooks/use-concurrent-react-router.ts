import { useContext, useEffect, startTransition } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

export const useConcurrentReactRouter = () => {
  // 获取 React Router 内部的 navigator 上下文，以便覆盖 React Router DOM 内部的方法
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    const originalNavigatorGo = navigator.go.bind(navigator);
    const originalNavigatorPush = navigator.push.bind(navigator);
    const originalNavigatorReplace = navigator.replace.bind(navigator);

    // Opt in React 18 的 Concurrent Rendering、避免 Suspense Boundary 重新出现
    navigator.go = (...args) => startTransition(() => {
      originalNavigatorGo.apply(navigator, args);
    });
    navigator.push = (...args) => startTransition(() => {
      originalNavigatorPush.apply(navigator, args);
    });
    navigator.replace = (...args) => startTransition(() => {
      originalNavigatorReplace.apply(navigator, args);
    });

    return () => {
      // 当组件卸载时，清理副作用（恢复原有的 navigator 方法）
      navigator.go = originalNavigatorGo;
      navigator.push = originalNavigatorPush;
      navigator.replace = originalNavigatorReplace;
    };
  }, [navigator]);
};
