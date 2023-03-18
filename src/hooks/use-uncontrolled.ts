import { useCallback, useRef, useState } from 'react';

export function useUncontrolled<T, E extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement>(initialValue: T) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(initialValue);
  const ref = useRef<E>(null);

  const onCommitState = useCallback(() => {
    if (ref.current) {
      setUncontrolledValue(ref.current.value as T);
    }
  }, []);

  return [uncontrolledValue, onCommitState, ref] as const;
}
