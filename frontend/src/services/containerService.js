import { getAuthToken } from '../utils/authUtils';

const API_URL = 'http://localhost:5000/api/containers';

class ContainerService {
  // Get headers with auth token
  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  // Get all containers with pagination
  static async getAllContainers(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch containers');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  }

  // Get containers by status
  static async getContainersByStatus(status, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/status/${status}?page=${page}&limit=${limit}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch containers by status');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching containers by status:', error);
      throw error;
    }
  }

  // Get container by ID
  static async getContainerById(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch container');
      }
      
      return data.container;
    } catch (error) {
      console.error('Error fetching container:', error);
      throw error;
    }
  }

  // Schedule container collection
  static async scheduleCollection(containerId) {
    try {
      const response = await fetch(`${API_URL}/${containerId}/collect`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule collection');
      }
      
      return data;
    } catch (error) {
      console.error('Error scheduling collection:', error);
      throw error;
    }
  }

  // Mark container for maintenance
  static async markForMaintenance(containerId, reason = 'Routine maintenance') {
    try {
      const response = await fetch(`${API_URL}/${containerId}/maintenance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark for maintenance');
      }
      
      return data;
    } catch (error) {
      console.error('Error marking for maintenance:', error);
      throw error;
    }
  }

  // Complete maintenance
  static async completeMaintenance(containerId) {
    try {
      const response = await fetch(`${API_URL}/${containerId}/maintenance/complete`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete maintenance');
      }
      
      return data;
    } catch (error) {
      console.error('Error completing maintenance:', error);
      throw error;
    }
  }
}

export default ContainerService;