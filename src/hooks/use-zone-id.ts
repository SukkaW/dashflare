import { useParams } from 'react-router-dom';

export function useZoneId(nullable?: false): string;
export function useZoneId(nullable: true): string | undefined;
export function useZoneId(nullable = false): string | undefined {
  const { zoneId } = useParams();

  if (zoneId) return zoneId;
  if (nullable) return undefined;
  throw new Error('No zone id found');
}
