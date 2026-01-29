import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

/**
 * Custom hook for CRUD operations
 * Reduces code duplication across list pages
 * 
 * @param {string} endpoint - API endpoint (e.g., '/employees')
 * @param {string} redirectPath - Path to redirect after create/update
 * @returns {object} - CRUD operation handlers
 */
export function useCrudOperations(endpoint, redirectPath) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new item
   */
  const create = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      const response = await api.post(endpoint, data);
      toast.success('Created successfully');
      
      if (redirectPath) {
        router.push(redirectPath);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, redirectPath, router, toast]);

  /**
   * Update an existing item
   */
  const update = useCallback(async (id, data) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`${endpoint}/${id}`, data);
      toast.success('Updated successfully');
      
      if (redirectPath) {
        router.push(redirectPath);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, redirectPath, router, toast]);

  /**
   * Delete an item with confirmation
   */
  const deleteItem = useCallback(async (id, confirmMessage = 'Are you sure you want to delete this item?') => {
    if (!confirm(confirmMessage)) {
      return { success: false, cancelled: true };
    }

    try {
      setIsDeleting(true);
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  }, [endpoint, toast]);

  /**
   * Fetch a single item by ID
   */
  const fetchOne = useCallback(async (id) => {
    try {
      const response = await api.get(`${endpoint}/${id}`);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [endpoint, toast]);

  return {
    create,
    update,
    deleteItem,
    fetchOne,
    isSubmitting,
    isDeleting,
  };
}

export default useCrudOperations;
