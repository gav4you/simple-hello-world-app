import { useMemo } from 'react';

/**
 * v8.6 usePageState
 * Normalizes React Query / async states into a single object.
 */
export default function usePageState({
  isLoading,
  isFetching,
  error,
  data,
  isEmpty,
}) {
  return useMemo(() => {
    const empty = typeof isEmpty === 'function' ? isEmpty(data) : false;
    return {
      isLoading: !!isLoading,
      isFetching: !!isFetching,
      error: error ?? null,
      isEmpty: empty,
      hasData: !empty && data !== undefined && data !== null,
    };
  }, [isLoading, isFetching, error, data, isEmpty]);
}
