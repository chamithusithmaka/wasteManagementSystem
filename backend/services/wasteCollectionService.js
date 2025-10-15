import WasteCollection from '../models/WasteCollection.js';

class WasteCollectionService {
  // Create a new waste collection pickup
  static async createPickup(pickupData) {
    try {
      const pickup = new WasteCollection(pickupData);
      return await pickup.save();
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming pickups for a user
  static async getUserPickups(userId, filter = {}) {
    try {
      const query = { userId, ...filter };
      return await WasteCollection.find(query)
                                  .sort({ scheduledDate: 1, scheduledTime: 1 })
                                  .exec();
    } catch (error) {
      throw error;
    }
  }

  // Get pickup by ID
  static async getPickupById(pickupId) {
    try {
      return await WasteCollection.findById(pickupId);
    } catch (error) {
      throw error;
    }
  }

  // Update pickup
  static async updatePickup(pickupId, updates) {
    try {
      return await WasteCollection.findByIdAndUpdate(
        pickupId,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Cancel pickup
  static async cancelPickup(pickupId) {
    try {
      return await WasteCollection.findByIdAndUpdate(
        pickupId,
        { $set: { status: 'Cancelled' } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all pickups with filtering and pagination
  static async getAllPickups(filter = {}, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const pickups = await WasteCollection.find(filter)
                                           .sort({ scheduledDate: 1, scheduledTime: 1 })
                                           .skip(skip)
                                           .limit(limit)
                                           .exec();
      
      const total = await WasteCollection.countDocuments(filter);
      return {
        pickups,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Assign staff to pickup
  static async assignStaff(pickupId, staffName) {
    try {
      return await WasteCollection.findByIdAndUpdate(
        pickupId,
        { $set: { assignedStaff: staffName, status: 'In Progress' } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Admin: Mark pickup as complete
  static async completePickup(pickupId, data) {
    try {
      const { wasteAmount } = data;
      return await WasteCollection.findByIdAndUpdate(
        pickupId,
        { 
          $set: { 
            status: 'Completed', 
            completedAt: new Date(),
            wasteAmount: wasteAmount || 0
          } 
        },
        { new: true }
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
      const completedThisMonth = await WasteCollection.countDocuments({
        userId,
        status: 'Completed',
        completedAt: { $gte: currentMonth }
      });
      
      // Count upcoming pickups
      const upcomingPickups = await WasteCollection.countDocuments({
        userId,
        status: 'Scheduled',
        scheduledDate: { $gte: new Date() }
      });
      
      // Calculate average container fill level
      const fillLevelResult = await WasteCollection.aggregate([
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