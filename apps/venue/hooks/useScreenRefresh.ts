import { useState, useCallback } from 'react';

interface UseScreenRefreshOptions {
  onRefresh: () => Promise<void>;
}

interface UseScreenRefreshReturn {
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
}

/**
 * Custom hook for handling pull-to-refresh functionality
 * Centralizes the refresh state management pattern used across screens
 */
export function useScreenRefresh({ onRefresh }: UseScreenRefreshOptions): UseScreenRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    handleRefresh,
  };
}

export default useScreenRefresh;
