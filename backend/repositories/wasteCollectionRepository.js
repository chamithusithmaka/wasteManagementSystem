import WasteCollection from '../models/WasteCollection.js';

/**
 * Repository for waste collection data operations
 * Handles direct database interactions
 */
class WasteCollectionRepository {
  /**
   * Create a new waste collection document
   * @param {Object} pickupData - Data for the new pickup
   * @returns {Promise<Object>} Created waste collection document
   */
  static async create(pickupData) {
    const pickup = new WasteCollection(pickupData);
    return await pickup.save();
  }

  /**
   * Find waste collections by user ID and optional filters
   * @param {string} userId - The user's ID
   * @param {Object} filter - Additional filter criteria
   * @returns {Promise<Array>} List of waste collections
   */
  static async findByUserId(userId, filter = {}) {
    const query = { userId, ...filter };
    return await WasteCollection.find(query)
                                .sort({ scheduledDate: 1, scheduledTime: 1 })
                                .exec();
  }

  /**
   * Find a waste collection by its ID
   * @param {string} pickupId - The pickup ID
   * @returns {Promise<Object|null>} Waste collection document or null
   */
  static async findById(pickupId) {
    return await WasteCollection.findById(pickupId);
  }

  /**
   * Update a waste collection by its ID
   * @param {string} pickupId - The pickup ID
   * @param {Object} updates - Fields to update
   * @param {boolean} runValidators - Whether to run validators
   * @returns {Promise<Object|null>} Updated waste collection or null
   */
  static async updateById(pickupId, updates, runValidators = true) {
    return await WasteCollection.findByIdAndUpdate(
      pickupId,
      { $set: updates },
      { new: true, runValidators }
    );
  }

  /**
   * Find waste collections with optional filters and pagination
   * @param {Object} filter - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated waste collections
   */
  static async findWithPagination(filter = {}, page = 1, limit = 20) {
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
  }

  /**
   * Count waste collections matching specific criteria
   * @param {Object} criteria - The query criteria
   * @returns {Promise<number>} Count of matching documents
   */
  static async countDocuments(criteria) {
    return await WasteCollection.countDocuments(criteria);
  }

  /**
   * Perform aggregation on waste collections
   * @param {Array} pipeline - Aggregation pipeline stages
   * @returns {Promise<Array>} Aggregation results
   */
  static async aggregate(pipeline) {
    return await WasteCollection.aggregate(pipeline);
  }
}

export default WasteCollectionRepository;