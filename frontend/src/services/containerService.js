// Container Service - API calls for container management
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const containerService = {
  /**
   * Get all containers
   * @returns {Promise} Array of containers
   */
  getAllContainers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  },

  /**
   * Get container by ID
   * @param {String} containerId - Container ID
   * @returns {Promise} Container object
   */
  getContainerById: async (containerId) => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_BY_ID(containerId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching container ${containerId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new container
   * @param {Object} containerData - Container data
   * @returns {Promise} Created container
   */
  createContainer: async (containerData) => {
    try {
      const response = await api.post(API_ENDPOINTS.CONTAINERS.CREATE, containerData);
      return response.data;
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  },

  /**
   * Update container
   * @param {String} containerId - Container ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated container
   */
  updateContainer: async (containerId, updateData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.CONTAINERS.UPDATE(containerId),
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating container ${containerId}:`, error);
      throw error;
    }
  },

  /**
   * Delete container
   * @param {String} containerId - Container ID
   * @returns {Promise} Success message
   */
  deleteContainer: async (containerId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.CONTAINERS.DELETE(containerId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting container ${containerId}:`, error);
      throw error;
    }
  },

  /**
   * Deactivate container (set to Out of Service)
   * @param {String} containerId - Container ID
   * @returns {Promise} Success message
   */
  deactivateContainer: async (containerId) => {
    try {
      const response = await api.put(API_ENDPOINTS.CONTAINERS.DEACTIVATE(containerId));
      return response.data;
    } catch (error) {
      console.error(`Error deactivating container ${containerId}:`, error);
      throw error;
    }
  },

  /**
   * Get containers by status
   * @param {String} status - Container status
   * @returns {Promise} Array of containers
   */
  getContainersByStatus: async (status) => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_BY_STATUS(status));
      return response.data;
    } catch (error) {
      console.error(`Error fetching containers by status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Get containers by type
   * @param {String} type - Container type
   * @returns {Promise} Array of containers
   */
  getContainersByType: async (type) => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_BY_TYPE(type));
      return response.data;
    } catch (error) {
      console.error(`Error fetching containers by type ${type}:`, error);
      throw error;
    }
  },

  /**
   * Get containers needing collection
   * @param {Number} threshold - Fill level threshold (default 80)
   * @returns {Promise} Array of containers
   */
  getContainersNeedingCollection: async (threshold = 80) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CONTAINERS.GET_NEEDING_COLLECTION}?threshold=${threshold}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching containers needing collection:', error);
      throw error;
    }
  },

  /**
   * Get container statistics
   * @returns {Promise} Statistics object
   */
  getStatistics: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_STATISTICS);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Filter containers by multiple criteria
   * @param {Object} filters - Filter criteria {city, area, status, search}
   * @returns {Promise} Filtered containers
   */
  filterContainers: async (filters) => {
    try {
      // Get all containers first (since backend doesn't have filter endpoint yet)
      const response = await api.get(API_ENDPOINTS.CONTAINERS.GET_ALL);
      const allContainers = response.data;
      
      // Apply filters client-side
      let filtered = allContainers;
      
      if (filters.city) {
        filtered = filtered.filter(c => c.containerLocation?.city === filters.city);
      }
      
      if (filters.area) {
        filtered = filtered.filter(c => c.containerLocation?.area === filters.area);
      }
      
      if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.containerId?.toLowerCase().includes(searchLower) ||
          c.containerLocation?.address?.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('Error filtering containers:', error);
      throw error;
    }
  },

  /**
   * Schedule a collection for a container
   * @param {String} containerId - Container ID
   * @returns {Promise} Success message
   */
  scheduleCollection: async (containerId) => {
    try {
      // Use the container schedule-collection endpoint directly
      const response = await api.put(
        API_ENDPOINTS.CONTAINERS.SCHEDULE_COLLECTION(containerId),
        { 
          collectionScheduled: true,
          scheduledDate: new Date().toISOString().split('T')[0],
          
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error scheduling collection for container ${containerId}:`, error);
      throw error;
    }
  },
};

export default containerService;
