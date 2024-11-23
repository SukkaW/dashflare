import { useParams } from 'react-router-dom';

export function createUseParams(key: string) {
  function useParamsValue(nullable?: false): string;
  function useParamsValue(nullable: true): string | undefined;
  function useParamsValue(nullable = false): string | undefined {
    const params = useParams();

    if (params[key]) return params[key];
    if (nullable) return undefined;
    throw new Error(`No ${key} found`);
  }

  return useParamsValue;
}

export const useZoneId = createUseParams('zoneId');
export const useAccountId = createUseParams('accountId');
