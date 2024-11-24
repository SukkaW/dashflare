import { Button, Pagination, Table, Text } from '@mantine/core';
import { usePagination } from '@/hooks/use-pagination';
import { useAccountId } from '../../../hooks/use-params';
import { useCloudflarePagesProjects } from '../../../lib/cloudflare/pages';
import { Link } from 'react-router-dom';

export default function CloudflarePagesProject() {
  const { pagination, handlePageIndexChange } = usePagination({
    pageIndex: 1,
    pageSize: 10
  });

  const accountId = useAccountId();
  const { data: projects } = useCloudflarePagesProjects(accountId, pagination.pageIndex, pagination.pageSize);
  const totalPage = projects?.result_info?.total_pages;

  return (
    <>
      <Table verticalSpacing={8}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Domains</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects?.result.map((page) => (
            <tr key={page.id}>
              <td>
                <Text size="md" weight={700}>{page.name}</Text>
              </td>
              <td>
                {page.domains.map(domain => (
                  <Text key={domain} truncate>{domain}</Text>
                ))}
              </td>
              <td>
                <Button component={Link} to={`./${page.name}`} compact variant="default">Enter</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPage != null && totalPage > 1 && (
        <Pagination
          total={totalPage}
          value={pagination.pageIndex}
          onChange={handlePageIndexChange}
        />
      )}
    </>
  );
}
