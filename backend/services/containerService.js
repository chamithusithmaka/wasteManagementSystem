// services/container.service.js
import containerRepository from "../repositories/containerRepository.js";

/**
 * Service Layer: Business logic for Container operations.
 * Handles business rules, validation, and orchestrates repository calls.
 * Does NOT directly access the database - delegates to Repository Layer.
 */
class ContainerService {
  /**
   * Create a new container with business logic
   * @param {Object} data - Container data
   * @returns {Promise<Object>} Created container
   */
  async createContainer(data) {
    // Business logic: Check if container already exists
    const exists = await containerRepository.exists(data.containerId);
    if (exists) {
      throw new Error(`Container with ID ${data.containerId} already exists`);
    }

    // Note: containerLevel defaults to 0, status defaults to 'Available', 
    // and installationDate defaults to current date/time in the model
    
    // Business logic: Auto-set status to Full if level is explicitly provided and high
    if (data.containerLevel !== undefined && data.containerLevel >= 95) {
      data.status = 'Full';
    }

    return await containerRepository.create(data);
  }

  /**
   * Get container by containerId
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Object|null>} Container or null
   */
  async getContainerById(containerId) {
    return await containerRepository.findByContainerId(containerId);
  }

  /**
   * Find a container by MongoDB ObjectId
   * @param {String} id - MongoDB ObjectId
   * @returns {Promise<Object|null>} Container document or null
   */
  async getContainerByMongoId(id) {
    return await containerRepository.findById(id);
  }

  /**
   * Get all containers
   * @returns {Promise<Array>} Array of containers
   */
  async getAllContainers() {
    return await containerRepository.findAll();
  }

  /**
   * Get containers by status
   * @param {String} status - Container status
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersByStatus(status) {
    return await containerRepository.findByStatus(status);
  }

  /**
   * Get containers by type
   * @param {String} containerType - Container type
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersByType(containerType) {
    return await containerRepository.findByType(containerType);
  }

  /**
   * Get containers by city
   * @param {String} city - City name
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersByCity(city) {
    return await containerRepository.findByCity(city);
  }

  /**
   * Get containers that need collection
   * @param {Number} threshold - Fill level threshold (default 80)
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersNeedingCollection(threshold = 80) {
    return await containerRepository.findNeedingCollection(threshold);
  }

  /**
   * Get containers with errors
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersWithErrors() {
    return await containerRepository.findWithErrors();
  }

  /**
   * Get containers needing maintenance
   * @returns {Promise<Array>} Array of containers
   */
  async getContainersNeedingMaintenance() {
    return await containerRepository.findNeedingMaintenance();
  }

  /**
   * Update container with business logic
   * @param {String} containerId - The unique container ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated container or null
   */
  async updateContainer(containerId, updateData) {
    // Business logic: Auto-update status based on level
    if (updateData.containerLevel !== undefined) {
      if (updateData.containerLevel >= 95) {
        updateData.status = 'Full';
      } else if (updateData.containerLevel < 80 && updateData.status === 'Full') {
        updateData.status = 'Available';
      }
    }

    // Business logic: If marking as Out of Service, set error flag
    if (updateData.status === 'Out of Service') {
      updateData.isErrorDetected = true;
    }

    return await containerRepository.updateByContainerId(containerId, updateData);
  }

  /**
   * Update container level with business logic
   * @param {String} containerId - The unique container ID
   * @param {Number} level - New level (0-100)
   * @returns {Promise<Object|null>} Updated container or null
   */
  async updateContainerLevel(containerId, level) {
    // Business logic: Validate level range
    if (level < 0 || level > 100) {
      throw new Error('Container level must be between 0 and 100');
    }

    return await containerRepository.updateLevel(containerId, level);
  }

  /**
   * Update container status with business logic
   * @param {String} containerId - The unique container ID
   * @param {String} status - New status
   * @returns {Promise<Object|null>} Updated container or null
   */
  async updateContainerStatus(containerId, status) {
    // Business logic: Validate status
    const validStatuses = ['Available', 'Full', 'Needs Maintenance', 'Out of Service'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return await containerRepository.updateStatus(containerId, status);
  }

  /**
   * Record a collection event with business logic
   * @param {String} containerId - The unique container ID
   * @param {Date} collectionDate - Date of collection
   * @returns {Promise<Object|null>} Updated container or null
   */
  async recordCollection(containerId, collectionDate = new Date()) {
    // Business logic: Verify container exists and needs collection
    const container = await containerRepository.findByContainerId(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    if (container.status === 'Out of Service') {
      throw new Error('Cannot collect from Out of Service container');
    }

    // Business logic: Reset level to 0 and update status
    return await containerRepository.recordCollection(containerId, collectionDate, 0);
  }

  /**
   * Delete container with business logic
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Object|null>} Deleted container or null
   */
  async deleteContainer(containerId) {
    // Business logic: Check if container exists before deleting
    const container = await containerRepository.findByContainerId(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    return await containerRepository.deleteByContainerId(containerId);
  }

  /**
   * Get container statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    return await containerRepository.getStatistics();
  }

  /**
   * Get statistics by container type
   * @returns {Promise<Array>} Statistics by type
   */
  async getStatisticsByType() {
    return await containerRepository.getStatisticsByType();
  }

  /**
   * Get statistics by status
   * @returns {Promise<Array>} Statistics by status
   */
  async getStatisticsByStatus() {
    return await containerRepository.getStatisticsByStatus();
  }

  /**
   * Schedule collection for containers that need it
   * @param {Date} scheduleDate - Date to schedule collection
   * @returns {Promise<Array>} Array of updated containers
   */
  async scheduleCollectionForNeedyContainers(scheduleDate) {
    // Business logic: Get containers needing collection
    const containers = await containerRepository.findNeedingCollection(80);
    
    // Business logic: Update each with collection schedule
    const updates = containers.map(container => ({
      containerId: container.containerId,
      updateData: { collectionSchedule: scheduleDate }
    }));

    if (updates.length > 0) {
      await containerRepository.bulkUpdate(updates);
    }

    return containers;
  }

  /**
   * Mark container for maintenance
   * @param {String} containerId - The unique container ID
   * @param {String} reason - Reason for maintenance
   * @returns {Promise<Object|null>} Updated container
   */
  async markForMaintenance(containerId, reason) {
    // Business logic: Update status and set error flag
    return await containerRepository.updateByContainerId(containerId, {
      status: 'Needs Maintenance',
      isErrorDetected: true
    });
  }

  /**
   * Complete maintenance on container
   * @param {String} containerId - The unique container ID
   * @returns {Promise<Object|null>} Updated container
   */
  async completeMaintenance(containerId) {
    // Business logic: Reset to Available and clear error
    return await containerRepository.updateByContainerId(containerId, {
      status: 'Available',
      isErrorDetected: false
    });
  }
}

export default new ContainerService();
