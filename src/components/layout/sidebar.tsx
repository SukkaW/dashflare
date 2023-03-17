import { memo, useMemo } from 'react';
import { useCloudflareApiTokenStatus } from '@/lib/cloudflare/token-status';
import { useToken } from '@/provider/token';

function SidebarContent() {
  const token = useToken();
  const { isLoading, data } = useCloudflareApiTokenStatus(token);
  const isTokenActive = useMemo(() => {
    if (isLoading) return false;
    if (!data) return false;
    return data.success && data.result.status === 'active';
  }, [data, isLoading]);

  if (!isTokenActive) return null;
  return (
    <div>Application navbar</div>
  );
}

export default memo(SidebarContent);
