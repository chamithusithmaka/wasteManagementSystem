import { getAuthToken } from '../utils/authUtils';

const API_URL = 'http://localhost:5000/api/waste-collection';

// Single responsibility: handle waste collection API requests
class WasteCollectionService {
  // Get headers with auth token
  static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  // Schedule a new pickup
  static async schedulePickup(pickupData) {
    try {
      const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(pickupData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule pickup');
      }
      
      return data;
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      throw error;
    }
  }

  // Get all pickups for the logged-in user
  static async getUserPickups(status = null) {
    try {
      let url = `${API_URL}/my-pickups`;
      if (status) url += `?status=${status}`;

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get pickups');
      }
      
      return data.pickups || [];
    } catch (error) {
      console.error('Error fetching user pickups:', error);
      throw error;
    }
  }

  // Get user stats
  static async getUserStats() {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get stats');
      }
      
      return data.stats || {};
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get a specific pickup
  static async getPickup(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get pickup details');
      }
      
      return data.pickup;
    } catch (error) {
      console.error('Error fetching pickup:', error);
      throw error;
    }
  }

  // Update a pickup
  static async updatePickup(id, updates) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update pickup');
      }
      
      return data.pickup;
    } catch (error) {
      console.error('Error updating pickup:', error);
      throw error;
    }
  }

  // Cancel a pickup
  static async cancelPickup(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel pickup');
      }
      
      return data;
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      throw error;
    }
  }

  // For admin: Get all pickups (with pagination)
  static async getAllPickups(status = null, page = 1, limit = 20) {
    try {
      let url = `${API_URL}/admin/all?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get all pickups');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching all pickups:', error);
      throw error;
    }
  }

  // For admin: Assign staff to pickup
  static async assignStaff(id, staffName) {
    try {
      const response = await fetch(`${API_URL}/admin/${id}/assign`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ staffName })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign staff');
      }
      
      return data;
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }
  }

  // For admin: Complete a pickup
  static async completePickup(id, wasteAmount) {
    try {
      const response = await fetch(`${API_URL}/admin/${id}/complete`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ wasteAmount })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete pickup');
      }
      
      return data;
    } catch (error) {
      console.error('Error completing pickup:', error);
      throw error;
    }
  }

  // Map backend pickup to frontend format for consistency
  static mapPickupToFrontend(pickup) {
    if (!pickup) return null;
    
    // Extract user data if it's populated
    const userData = pickup.userId && typeof pickup.userId === 'object' ? pickup.userId : null;
    
    return {
      id: pickup._id,
      type: pickup.wasteType,
      date: pickup.scheduledDate,
      time: pickup.scheduledTime,
      address: pickup.address,
      province: pickup.province,
      notes: pickup.notes,
      status: pickup.status,
      confirmationId: pickup.confirmationId,
      containerFillLevel: pickup.containerFillLevel,
      wasteAmount: pickup.wasteAmount,
      completedAt: pickup.completedAt,
      assignedStaff: pickup.assignedStaff,
      // Add user details from populated field if available
      userName: userData?.name || 'Not available',
      userEmail: userData?.email || null,
      userPhone: userData?.phone || null,
      // Keep the original userId regardless of whether it's populated or not
      userId: userData?._id || pickup.userId || null
    };
  }

  // Map frontend pickup to backend format
  static mapPickupToBackend(pickup) {
    return {
      address: pickup.address,
      province: pickup.province,
      wasteType: pickup.type || pickup.wasteType,
      scheduledDate: pickup.date,
      scheduledTime: pickup.time,
      notes: pickup.notes,
      containerFillLevel: pickup.containerFillLevel || 50
    };
  }
}

export default WasteCollectionService;