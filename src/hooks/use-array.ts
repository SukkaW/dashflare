import { useCallback, useState } from 'react';

export const useArray = <T>(initialValue: T[] | (() => T[])) => {
  const [value, setValue] = useState<T[]>(initialValue);
  return [
    value,
    useCallback((item: T) => setValue(value => value.concat(item)), []),
    useCallback(() => setValue(() => []), [])
  ] as const;
};
