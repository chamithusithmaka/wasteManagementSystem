import { useState, useEffect } from 'react';
import containerService from '../services/containerService';

/**
 * Custom hook for container management operations
 * Handles CRUD operations and state management for containers
 */
export const useContainerManagement = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const response = await containerService.getAllContainers();
      setContainers(response.data || response);
      setError(null);
    } catch (err) {
      console.error('Error fetching containers:', err);
      setError(err.response?.data?.error || 'Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  const deleteContainer = async (containerId) => {
    try {
      await containerService.deleteContainer(containerId);
      await fetchContainers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting container:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete container' 
      };
    }
  };

  const deactivateContainer = async (containerId) => {
    try {
      await containerService.deactivateContainer(containerId);
      await fetchContainers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deactivating container:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to deactivate container' 
      };
    }
  };

  const updateContainer = async (containerId, updateData) => {
    try {
      await containerService.updateContainer(containerId, updateData);
      await fetchContainers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating container:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update container' 
      };
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  return {
    containers,
    loading,
    error,
    fetchContainers,
    deleteContainer,
    deactivateContainer,
    updateContainer
  };
};