import { useAccountId } from '@/hooks/use-params';
import { useCallback, useMemo, useState } from 'react';
import { useArray } from 'foxact/use-array';
import { Button, Code, Stack } from '@mantine/core';
import { useToken } from '@/context/token';
import { fetcherWithAuthorization, fetcherWithAuthorizationAndPagination } from '@/lib/fetcher';
import { formatDate } from 'date-fns/format';

export default function CloudflarePagesDeleteDeployments() {
  const accountId = useAccountId(false);
  const token = useToken();

  const [loading, setLoading] = useState(false);
  const [logs, appendLog, resetLogs] = useArray<string>();

  const handleDeleteCloudflarePagesDeployments = useCallback(async () => {
    try {
      setLoading(true);
      resetLogs();

      const allProjects: Cloudflare.Page[] = [];

      const start = new Date();
      const startTimtstamp = start.getTime();

      appendLog(`Stale Cloudflare Pages deployments deletion started at ${formatDate(start, 'yyyy-MM-dd HH:mm:ss')}`);

      let page = 1;
      while (true) {
      // eslint-disable-next-line no-await-in-loop -- one request at a time
        const resp = await fetcherWithAuthorizationAndPagination<Cloudflare.APIResponse<Cloudflare.Page[]>>(
          [`client/v4/accounts/${accountId}/pages/projects`, token, page, 10]
        );
        resp.result.forEach(i => allProjects.push(i));
        appendLog(`Fetched ${resp.result.length} projects`);
        if (resp.result_info!.page >= resp.result_info!.total_pages) {
          break;
        }
        page++;
      }

      appendLog(`Fetched ${allProjects.length} projects in total`);

      for (const project of allProjects) {
        appendLog(`[${project.name}] Fetching deployments for project (${project.domains.join(', ')})`);

        let page = 1;
        let successDeployments = 0;
        let failedDeployments = 0;
        while (true) {
        // eslint-disable-next-line no-await-in-loop -- one request at a time
          const resp = await fetcherWithAuthorizationAndPagination<Cloudflare.APIResponse<Cloudflare.PagesDeploymentInfo[]>>(
          // https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments
            [`client/v4/accounts/${accountId}/pages/projects/${project.name}/deployments`, token, page, 15]
          );

          for (const deployment of resp.result) {
            const date = new Date(deployment.created_on);
            const dateStr = formatDate(date, 'yyyy-MM-dd HH:mm:ss');
            const success = deployment.latest_stage.status === 'success';

            const key = `${dateStr} ${deployment.environment} ${deployment.url} (skipped: ${deployment.is_skipped}, success ${success})`;

            if (success) {
              successDeployments++;
            } else {
              failedDeployments++;
            }

            if (!deployment.is_skipped || success) {
              if (deployment.aliases !== null && deployment.aliases.length > 0) {
                appendLog(`[${deployment.project_name}] (skip active deployments ${deployment.aliases.join(', ')}) ${key}`);
                continue;
              }
              if (successDeployments <= 20) {
                appendLog(`[${deployment.project_name}] (skip first 20 succeed) ${key}`);
                continue;
              }
              if ((startTimtstamp - date.getTime()) <= 1000 * 60 * 60 * 24 * 30) {
                appendLog(`[${deployment.project_name}] (skip recent 30d) ${key}`);
                continue;
              }
            }
            if (!success && failedDeployments <= 7) {
              appendLog(`[${deployment.project_name}] (skip first 7 failed) ${key}`);
              continue;
            }

            appendLog(`[${deployment.project_name}] (delete) ${dateStr} ${deployment.environment} ${deployment.url}`);

            // eslint-disable-next-line no-await-in-loop -- one request at a time
            await fetcherWithAuthorization(
              // https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}
              [`client/v4/accounts/${accountId}/pages/projects/${project.name}/deployments/${deployment.id}`, token],
              {
                method: 'DELETE'
              }
            );
          }

          if (resp.result_info!.page >= resp.result_info!.total_pages) {
            break;
          }
          page++;
        }
      }

      appendLog('Stale Cloudflare Pages deployments deletion completed');
    } finally {
      setLoading(false);
    }
  }, [accountId, appendLog, resetLogs, token]);

  return (
    <Stack>
      <Button
        type="button"
        variant="filled"
        disabled={loading}
        loading={loading}
        onClick={handleDeleteCloudflarePagesDeployments}
      >
        Delete Old Cloudflare Pages deployments
      </Button>
      <Code
        block
        h={500}
        mah={500}
        lh={1.7}
        sx={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        ref={(el) => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }}
      >
        {useMemo(() => logs.slice(-100).join('\n'), [logs])}
      </Code>
    </Stack>
  );
}
