import WasteCollectionRepository from '../repositories/wasteCollectionRepository.js';
import WasteCollection from '../models/WasteCollection.js';

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
      // Use populate to include user details from the User model
      return await WasteCollectionRepository.findByIdWithUserDetails(pickupId);
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

  // Cancel pickup with time restriction
  static async cancelPickupWithTimeRestriction(pickupId, userId) {
    try {
      const pickup = await WasteCollectionRepository.findById(pickupId);
      
      if (!pickup) {
        throw new Error('Pickup not found');
      }
      
      // Check if pickup belongs to the user
      if (pickup.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized to cancel this pickup');
      }
      
      // Check if pickup is in a cancellable status
      if (pickup.status !== 'Scheduled' && pickup.status !== 'Pending') {
        throw new Error(`Cannot cancel a pickup that is already ${pickup.status}`);
      }
      
      // Check if pickup was created within the last 2 hours
      const createdAt = pickup.createdAt || pickup._id.getTimestamp();
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      if (createdAt < twoHoursAgo) {
        throw new Error('Pickup can only be cancelled within 2 hours of creation');
      }
      
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
  static async completePickup(id, { wasteAmount }) {
    try {
      console.log(`WasteCollectionService: Completing pickup ${id} with amount ${wasteAmount}`);

      // 1. Update using Mongoose model (friend's logic)
      const pickup = await WasteCollection.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'Completed',
            completedAt: new Date(),
            wasteAmount: wasteAmount || 0
          }
        },
        { new: true, runValidators: true }
      );

      // 2. Also update using repository (your logic)
      await WasteCollectionRepository.updateById(
        id,
        { 
          status: 'Completed', 
          completedAt: new Date(),
          wasteAmount: wasteAmount || 0
        }
      );

      console.log(`WasteCollectionService: Pickup completed, status: ${pickup.status}`);
      return pickup;
    } catch (error) {
      console.error('Error completing pickup:', error);
      throw new Error(`Failed to complete pickup: ${error.message}`);
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