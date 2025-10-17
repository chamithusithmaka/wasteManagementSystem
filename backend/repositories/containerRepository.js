// repositories/containerRepository.js
import Container from "../models/Container.js";

/**
 * Repository Layer: Direct database access for Container entity.
 * Handles all CRUD operations and database queries.
 * This layer is responsible for data persistence only.
 */
class ContainerRepository {
  /**
   * Create a new container in the database
   * @param {Object} containerData - Container data to insert
   * @returns {Promise<Object>} Created container document
   */
  async create(containerData) {
    return await Container.create(containerData);
  }

  /**
   * Find a container by containerId
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Object|null>} Container document or null
   */
  async findByContainerId(containerId) {
    return await Container.findOne({ containerId });
  }

  /**
   * Find a container by MongoDB _id
   * @param {String} id - MongoDB ObjectId
   * @returns {Promise<Object|null>} Container document or null
   */
  async findById(id) {
    return await Container.findById(id);
  }

  /**
   * Find all containers
   * @returns {Promise<Array>} Array of all container documents
   */
  async findAll() {
    return await Container.find();
  }

  /**
   * Find containers by status
   * @param {String} status - Container status to filter by
   * @returns {Promise<Array>} Array of container documents
   */
  async findByStatus(status) {
    return await Container.find({ status });
  }

  /**
   * Find containers by type
   * @param {String} containerType - Container type to filter by
   * @returns {Promise<Array>} Array of container documents
   */
  async findByType(containerType) {
    return await Container.find({ containerType });
  }

  /**
   * Find containers by location (city)
   * @param {String} city - City to filter by
   * @returns {Promise<Array>} Array of container documents
   */
  async findByCity(city) {
    return await Container.find({ "containerLocation.city": city });
  }

  /**
   * Find containers by location (province)
   * @param {String} province - Province to filter by
   * @returns {Promise<Array>} Array of container documents
   */
  async findByProvince(province) {
    return await Container.find({ "containerLocation.province": province });
  }

  /**
   * Find containers that need collection (level >= threshold)
   * @param {Number} threshold - Fill level threshold (default 80)
   * @returns {Promise<Array>} Array of container documents
   */
  async findNeedingCollection(threshold = 80) {
    return await Container.find({
      containerLevel: { $gte: threshold },
      status: { $in: ['Available', 'Full'] }
    });
  }

  /**
   * Find containers with errors detected
   * @returns {Promise<Array>} Array of container documents
   */
  async findWithErrors() {
    return await Container.find({ isErrorDetected: true });
  }

  /**
   * Find containers needing maintenance
   * @returns {Promise<Array>} Array of container documents
   */
  async findNeedingMaintenance() {
    return await Container.find({ 
      status: { $in: ['Needs Maintenance', 'Out of Service'] }
    });
  }

  /**
   * Update a container by containerId
   * @param {String} containerId - The unique container ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated container document or null
   */
  async updateByContainerId(containerId, updateData) {
    return await Container.findOneAndUpdate(
      { containerId },
      { ...updateData, lastUpdatedDate: new Date() },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update a container by MongoDB _id
   * @param {String} id - MongoDB ObjectId
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated container document or null
   */
  async updateById(id, updateData) {
    return await Container.findByIdAndUpdate(
      id,
      { ...updateData, lastUpdatedDate: new Date() },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update container level and last updated date
   * @param {String} containerId - The unique container ID
   * @param {Number} level - New container level (0-100)
   * @returns {Promise<Object|null>} Updated container document or null
   */
  async updateLevel(containerId, level) {
    // Determine status based on level
    let status;
    if (level >= 95) {
      status = 'Full';
    } else if (level >= 80) {
      status = 'Near Full';
    } else {
      status = 'Available';
    }

    return await Container.findOneAndUpdate(
      { containerId },
      { 
        containerLevel: level,
        lastUpdatedDate: new Date(),
        // Auto-update status based on level
        status: status
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update container status
   * @param {String} containerId - The unique container ID
   * @param {String} status - New status
   * @returns {Promise<Object|null>} Updated container document or null
   */
  async updateStatus(containerId, status) {
    return await Container.findOneAndUpdate(
      { containerId },
      { 
        status,
        lastUpdatedDate: new Date()
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Record a collection event (reset level, update dates)
   * @param {String} containerId - The unique container ID
   * @param {Date} collectionDate - Date of collection
   * @param {Number} newLevel - Level after collection (default 0)
   * @returns {Promise<Object|null>} Updated container document or null
   */
  async recordCollection(containerId, collectionDate = new Date(), newLevel = 0) {
    return await Container.findOneAndUpdate(
      { containerId },
      {
        containerLevel: newLevel,
        lastCollectionDate: collectionDate,
        lastUpdatedDate: new Date(),
        status: 'Available'
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a container by containerId
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Object|null>} Deleted container document or null
   */
  async deleteByContainerId(containerId) {
    return await Container.findOneAndDelete({ containerId });
  }

  /**
   * Delete a container by MongoDB _id
   * @param {String} id - MongoDB ObjectId
   * @returns {Promise<Object|null>} Deleted container document or null
   */
  async deleteById(id) {
    return await Container.findByIdAndDelete(id);
  }

  /**
   * Count total containers
   * @returns {Promise<Number>} Total count
   */
  async countAll() {
    return await Container.countDocuments();
  }

  /**
   * Count containers by status
   * @param {String} status - Container status
   * @returns {Promise<Number>} Count
   */
  async countByStatus(status) {
    return await Container.countDocuments({ status });
  }

  /**
   * Count containers by type
   * @param {String} containerType - Container type
   * @returns {Promise<Number>} Count
   */
  async countByType(containerType) {
    return await Container.countDocuments({ containerType });
  }

  /**
   * Get aggregated statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    const stats = await Container.aggregate([
      {
        $group: {
          _id: null,
          totalContainers: { $sum: 1 },
          averageLevel: { $avg: "$containerLevel" },
          totalCapacity: { $sum: "$containerCapacity" },
          containersNearFull: {
            $sum: { $cond: [{ $gte: ["$containerLevel", 80] }, 1, 0] }
          },
          containersFull: {
            $sum: { $cond: [{ $gte: ["$containerLevel", 95] }, 1, 0] }
          },
          containersWithErrors: {
            $sum: { $cond: ["$isErrorDetected", 1, 0] }
          }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : null;
  }

  /**
   * Get statistics by container type
   * @returns {Promise<Array>} Array of statistics per type
   */
  async getStatisticsByType() {
    return await Container.aggregate([
      {
        $group: {
          _id: "$containerType",
          count: { $sum: 1 },
          averageLevel: { $avg: "$containerLevel" },
          totalCapacity: { $sum: "$containerCapacity" },
          needingCollection: {
            $sum: { $cond: [{ $gte: ["$containerLevel", 80] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  /**
   * Get statistics by status
   * @returns {Promise<Array>} Array of statistics per status
   */
  async getStatisticsByStatus() {
    return await Container.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          averageLevel: { $avg: "$containerLevel" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  /**
   * Check if container exists by containerId
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Boolean>} True if exists
   */
  async exists(containerId) {
    const count = await Container.countDocuments({ containerId });
    return count > 0;
  }

  /**
   * Bulk update containers
   * @param {Array} updates - Array of {containerId, updateData}
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkUpdate(updates) {
    const operations = updates.map(({ containerId, updateData }) => ({
      updateOne: {
        filter: { containerId },
        update: { $set: { ...updateData, lastUpdatedDate: new Date() } }
      }
    }));

    return await Container.bulkWrite(operations);
  }

  /**
   * Find containers by status with pagination
   * @param {String} status - Container status to filter by
   * @param {Number} page - Page number
   * @param {Number} limit - Items per page
   * @returns {Promise<Array>} Array of container documents
   */
  async findByStatusPaginated(status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Container.find({ status })
      .skip(skip)
      .limit(limit)
      .sort({ containerLevel: -1 }); // Sort by container level descending
  }
}

export default new ContainerRepository();
