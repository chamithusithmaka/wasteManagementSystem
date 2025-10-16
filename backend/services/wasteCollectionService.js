import WasteCollectionRepository from '../repositories/wasteCollectionRepository.js';

class WasteCollectionService {
  // Create a new waste collection pickup
  static async createPickup(pickupData) {
    try {
      return await WasteCollectionRepository.create(pickupData);
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming pickups for a user
  static async getUserPickups(userId, filter = {}) {
    try {
      return await WasteCollectionRepository.findByUserId(userId, filter);
    } catch (error) {
      throw error;
    }
  }

  // Get pickup by ID
  static async getPickupById(pickupId) {
    try {
      return await WasteCollectionRepository.findById(pickupId);
    } catch (error) {
      throw error;
    }
  }

  // Update pickup
  static async updatePickup(pickupId, updates) {
    try {
      return await WasteCollectionRepository.updateById(pickupId, updates);
    } catch (error) {
      throw error;
    }
  }

  // Cancel pickup
  static async cancelPickup(pickupId) {
    try {
      return await WasteCollectionRepository.updateById(pickupId, { status: 'Cancelled' });
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all pickups with filtering and pagination
  static async getAllPickups(filter = {}, page = 1, limit = 20) {
    try {
      return await WasteCollectionRepository.findWithPagination(filter, page, limit);
    } catch (error) {
      throw error;
    }
  }

  // Admin: Assign staff to pickup
  static async assignStaff(pickupId, staffName) {
    try {
      return await WasteCollectionRepository.updateById(
        pickupId,
        { assignedStaff: staffName, status: 'In Progress' }
      );
    } catch (error) {
      throw error;
    }
  }

  // Admin: Mark pickup as complete
  static async completePickup(pickupId, data) {
    try {
      const { wasteAmount } = data;
      return await WasteCollectionRepository.updateById(
        pickupId,
        { 
          status: 'Completed', 
          completedAt: new Date(),
          wasteAmount: wasteAmount || 0
        }
      );
    } catch (error) {
      throw error;
    }
  }

  // Get pickup stats for a user
  static async getUserStats(userId) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month
      
      // Count completed this month
      const completedThisMonth = await WasteCollectionRepository.countDocuments({
        userId,
        status: 'Completed',
        completedAt: { $gte: currentMonth }
      });
      
      // Count upcoming pickups
      const upcomingPickups = await WasteCollectionRepository.countDocuments({
        userId,
        status: 'Scheduled',
        scheduledDate: { $gte: new Date() }
      });
      
      // Calculate average container fill level
      const fillLevelResult = await WasteCollectionRepository.aggregate([
        { $match: { userId, containerFillLevel: { $ne: null } } },
        { $group: { _id: null, avgFill: { $avg: '$containerFillLevel' } } }
      ]);
      
      const avgFill = fillLevelResult.length > 0 ? Math.round(fillLevelResult[0].avgFill) : null;
      
      return {
        completedThisMonth,
        upcomingPickups,
        avgFill
      };
    } catch (error) {
      throw error;
    }
  }
}

export default WasteCollectionService;