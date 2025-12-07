import { useCallback, useMemo, useState } from 'react';

export function usePaginatedList<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);

  const visibleItems = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize]);
  const hasMore = items.length > visibleItems.length;
  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  const reset = useCallback(() => setPage(1), []);

  return { visibleItems, hasMore, loadMore, reset };
}
