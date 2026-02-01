'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for standardized async operation handling
 * 
 * @returns {Object} Async operation utilities
 * 
 * @example
 * const { execute, loading, error, data, reset } = useAsync();
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(api.post('/users', formData));
 *   if (result) {
 *     toast.success('User created!');
 *   }
 * };
 */
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction;
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for handling async operations with immediate execution
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} deps - Dependencies array for re-execution
 * @returns {Object} { data, loading, error, refetch }
 * 
 * @example
 * const { data: users, loading, error, refetch } = useAsyncEffect(
 *   () => api.get('/users'),
 *   []
 * );
 */
export function useAsyncEffect(asyncFunction, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      setState({ data: null, loading: false, error: err });
      return null;
    }
  }, deps);

  // Initial fetch
  useState(() => {
    refetch();
  });

  return {
    ...state,
    refetch,
  };
}

export default useAsync;
