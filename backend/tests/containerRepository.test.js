import mongoose from 'mongoose';
import Container from '../models/Container.js';
import containerRepository from '../repositories/containerRepository.js';

describe('Container Repository', () => {
  afterEach(async () => {
    await Container.deleteMany({});
  });

  describe('Create Operations', () => {
    it('should create a new container', async () => {
      const containerData = {
        containerId: 'REPO001',
        containerType: 'plastic',
        containerCapacity: 100
      };

      const container = await containerRepository.create(containerData);

      expect(container.containerId).toBe('REPO001');
      expect(container.containerType).toBe('plastic');
      expect(container.containerCapacity).toBe(100);
      expect(container._id).toBeDefined();
    });

    it('should create container with all fields', async () => {
      const containerData = {
        containerId: 'REPO002',
        containerType: 'organic',
        containerCapacity: 150,
        containerLevel: 75,
        status: 'Near Full',
        containerLocation: {
          address: '123 Main Street',
          city: 'Colombo',
          province: 'Western Province',
          coordinates: {
            latitude: 6.9271,
            longitude: 79.8612
          }
        },
        isErrorDetected: false
      };

      const container = await containerRepository.create(containerData);

      expect(container.containerId).toBe('REPO002');
      expect(container.containerLevel).toBe(75);
      expect(container.status).toBe('Near Full');
      expect(container.containerLocation.address).toBe('123 Main Street');
      expect(container.containerLocation.coordinates.latitude).toBe(6.9271);
    });
  });

  describe('Find Operations', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'FIND001',
          containerType: 'plastic',
          containerCapacity: 100,
          status: 'Available',
          containerLocation: { city: 'Colombo', province: 'Western Province' }
        },
        {
          containerId: 'FIND002',
          containerType: 'organic',
          containerCapacity: 150,
          status: 'Full',
          containerLevel: 95,
          isErrorDetected: true,
          containerLocation: { city: 'Kandy', province: 'Central Province' }
        },
        {
          containerId: 'FIND003',
          containerType: 'glass',
          containerCapacity: 80,
          status: 'Needs Maintenance',
          containerLevel: 60,
          isErrorDetected: true,
          containerLocation: { city: 'Galle', province: 'Southern Province' }
        }
      ]);
    });

    it('should find container by containerId', async () => {
      const container = await containerRepository.findByContainerId('FIND001');

      expect(container).toBeTruthy();
      expect(container.containerId).toBe('FIND001');
      expect(container.containerType).toBe('plastic');
    });

    it('should return null for non-existent containerId', async () => {
      const container = await containerRepository.findByContainerId('NON_EXISTENT');

      expect(container).toBeNull();
    });

    it('should find container by MongoDB ObjectId', async () => {
      const savedContainer = await Container.findOne({ containerId: 'FIND001' });
      const container = await containerRepository.findById(savedContainer._id);

      expect(container).toBeTruthy();
      expect(container.containerId).toBe('FIND001');
    });

    it('should find all containers', async () => {
      const containers = await containerRepository.findAll();

      expect(containers).toHaveLength(3);
      expect(containers.map(c => c.containerId)).toContain('FIND001');
      expect(containers.map(c => c.containerId)).toContain('FIND002');
      expect(containers.map(c => c.containerId)).toContain('FIND003');
    });

    it('should find containers by status', async () => {
      const availableContainers = await containerRepository.findByStatus('Available');
      const fullContainers = await containerRepository.findByStatus('Full');

      expect(availableContainers).toHaveLength(1);
      expect(availableContainers[0].containerId).toBe('FIND001');
      expect(fullContainers).toHaveLength(1);
      expect(fullContainers[0].containerId).toBe('FIND002');
    });

    it('should find containers by type', async () => {
      const plasticContainers = await containerRepository.findByType('plastic');
      const organicContainers = await containerRepository.findByType('organic');

      expect(plasticContainers).toHaveLength(1);
      expect(plasticContainers[0].containerId).toBe('FIND001');
      expect(organicContainers).toHaveLength(1);
      expect(organicContainers[0].containerId).toBe('FIND002');
    });

    it('should find containers by city', async () => {
      const colomboContainers = await containerRepository.findByCity('Colombo');

      expect(colomboContainers).toHaveLength(1);
      expect(colomboContainers[0].containerId).toBe('FIND001');
    });

    it('should find containers by province', async () => {
      const westernContainers = await containerRepository.findByProvince('Western Province');

      expect(westernContainers).toHaveLength(1);
      expect(westernContainers[0].containerId).toBe('FIND001');
    });

    it('should find containers needing collection', async () => {
      const needingCollection = await containerRepository.findNeedingCollection(80);

      expect(needingCollection).toHaveLength(1);
      expect(needingCollection[0].containerId).toBe('FIND002');
    });

    it('should find containers with custom threshold', async () => {
      const needingCollection = await containerRepository.findNeedingCollection(60);

      expect(needingCollection).toHaveLength(1); // Only FIND002 with status 'Full'
      expect(needingCollection[0].containerId).toBe('FIND002');
    });

    it('should find containers with errors', async () => {
      const errorContainers = await containerRepository.findWithErrors();

      expect(errorContainers).toHaveLength(2);
      expect(errorContainers.map(c => c.containerId)).toContain('FIND002');
      expect(errorContainers.map(c => c.containerId)).toContain('FIND003');
    });

    it('should find containers needing maintenance', async () => {
      const maintenanceContainers = await containerRepository.findNeedingMaintenance();

      expect(maintenanceContainers).toHaveLength(1);
      expect(maintenanceContainers[0].containerId).toBe('FIND003');
    });
  });

  describe('Update Operations', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'UPDATE001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 50,
        status: 'Available'
      });
    });

    it('should update container by containerId', async () => {
      const updateData = {
        containerLevel: 85,
        status: 'Near Full'
      };

      const updated = await containerRepository.updateByContainerId('UPDATE001', updateData);

      expect(updated.containerLevel).toBe(85);
      expect(updated.status).toBe('Near Full');
      expect(updated.lastUpdatedDate).toBeDefined();
    });

    it('should update container by MongoDB ObjectId', async () => {
      const updateData = {
        containerLevel: 95,
        status: 'Full'
      };

      const updated = await containerRepository.updateById(container._id, updateData);

      expect(updated.containerLevel).toBe(95);
      expect(updated.status).toBe('Full');
    });

    it('should return null for non-existent container in updateByContainerId', async () => {
      const updated = await containerRepository.updateByContainerId('NON_EXISTENT', {
        containerLevel: 75
      });

      expect(updated).toBeNull();
    });

    it('should update container level with auto status determination', async () => {
      const updated = await containerRepository.updateLevel('UPDATE001', 85);

      expect(updated.containerLevel).toBe(85);
      expect(updated.status).toBe('Near Full');
      expect(updated.lastUpdatedDate).toBeDefined();
    });

    it('should set status to Full for level >= 95', async () => {
      const updated = await containerRepository.updateLevel('UPDATE001', 95);

      expect(updated.containerLevel).toBe(95);
      expect(updated.status).toBe('Full');
    });

    it('should set status to Available for level < 80', async () => {
      const updated = await containerRepository.updateLevel('UPDATE001', 70);

      expect(updated.containerLevel).toBe(70);
      expect(updated.status).toBe('Available');
    });

    it('should update container status', async () => {
      const updated = await containerRepository.updateStatus('UPDATE001', 'Needs Maintenance');

      expect(updated.status).toBe('Needs Maintenance');
      expect(updated.lastUpdatedDate).toBeDefined();
    });

    it('should record collection event', async () => {
      const collectionDate = new Date('2025-10-18T10:00:00Z');
      const updated = await containerRepository.recordCollection('UPDATE001', collectionDate, 0);

      expect(updated.containerLevel).toBe(0);
      expect(updated.status).toBe('Available');
      expect(updated.lastCollectionDate).toEqual(collectionDate);
      expect(updated.lastUpdatedDate).toBeDefined();
    });

    it('should record collection with default values', async () => {
      const updated = await containerRepository.recordCollection('UPDATE001');

      expect(updated.containerLevel).toBe(0);
      expect(updated.status).toBe('Available');
      expect(updated.lastCollectionDate).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'DELETE001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should delete container by containerId', async () => {
      const deleted = await containerRepository.deleteByContainerId('DELETE001');

      expect(deleted.containerId).toBe('DELETE001');

      // Verify deletion
      const found = await Container.findOne({ containerId: 'DELETE001' });
      expect(found).toBeNull();
    });

    it('should delete container by MongoDB ObjectId', async () => {
      const deleted = await containerRepository.deleteById(container._id);

      expect(deleted.containerId).toBe('DELETE001');

      // Verify deletion
      const found = await Container.findById(container._id);
      expect(found).toBeNull();
    });

    it('should return null when deleting non-existent container', async () => {
      const deleted = await containerRepository.deleteByContainerId('NON_EXISTENT');

      expect(deleted).toBeNull();
    });
  });

  describe('Count Operations', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'COUNT001',
          containerType: 'plastic',
          containerCapacity: 100,
          status: 'Available'
        },
        {
          containerId: 'COUNT002',
          containerType: 'plastic',
          containerCapacity: 150,
          status: 'Full'
        },
        {
          containerId: 'COUNT003',
          containerType: 'organic',
          containerCapacity: 120,
          status: 'Available'
        }
      ]);
    });

    it('should count all containers', async () => {
      const count = await containerRepository.countAll();

      expect(count).toBe(3);
    });

    it('should count containers by status', async () => {
      const availableCount = await containerRepository.countByStatus('Available');
      const fullCount = await containerRepository.countByStatus('Full');

      expect(availableCount).toBe(2);
      expect(fullCount).toBe(1);
    });

    it('should count containers by type', async () => {
      const plasticCount = await containerRepository.countByType('plastic');
      const organicCount = await containerRepository.countByType('organic');

      expect(plasticCount).toBe(2);
      expect(organicCount).toBe(1);
    });
  });

  describe('Statistics and Aggregation', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'STATS001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: 85,
          status: 'Near Full',
          isErrorDetected: false
        },
        {
          containerId: 'STATS002',
          containerType: 'plastic',
          containerCapacity: 150,
          containerLevel: 95,
          status: 'Full',
          isErrorDetected: true
        },
        {
          containerId: 'STATS003',
          containerType: 'organic',
          containerCapacity: 120,
          containerLevel: 40,
          status: 'Available',
          isErrorDetected: false
        }
      ]);
    });

    it('should get overall statistics', async () => {
      const stats = await containerRepository.getStatistics();

      expect(stats.totalContainers).toBe(3);
      expect(stats.averageLevel).toBeCloseTo(73.33, 1); // (85 + 95 + 40) / 3
      expect(stats.totalCapacity).toBe(370); // 100 + 150 + 120
      expect(stats.containersNearFull).toBe(2); // level >= 80
      expect(stats.containersFull).toBe(1); // level >= 95
      expect(stats.containersWithErrors).toBe(1);
    });

    it('should get statistics by container type', async () => {
      const statsByType = await containerRepository.getStatisticsByType();

      expect(statsByType).toHaveLength(2);

      const plasticStats = statsByType.find(s => s._id === 'plastic');
      const organicStats = statsByType.find(s => s._id === 'organic');

      expect(plasticStats.count).toBe(2);
      expect(plasticStats.averageLevel).toBe(90); // (85 + 95) / 2
      expect(plasticStats.totalCapacity).toBe(250); // 100 + 150
      expect(plasticStats.needingCollection).toBe(2);

      expect(organicStats.count).toBe(1);
      expect(organicStats.averageLevel).toBe(40);
      expect(organicStats.totalCapacity).toBe(120);
      expect(organicStats.needingCollection).toBe(0);
    });

    it('should get statistics by status', async () => {
      const statsByStatus = await containerRepository.getStatisticsByStatus();

      expect(statsByStatus).toHaveLength(3);

      const availableStats = statsByStatus.find(s => s._id === 'Available');
      const nearFullStats = statsByStatus.find(s => s._id === 'Near Full');
      const fullStats = statsByStatus.find(s => s._id === 'Full');

      expect(availableStats.count).toBe(1);
      expect(availableStats.averageLevel).toBe(40);

      expect(nearFullStats.count).toBe(1);
      expect(nearFullStats.averageLevel).toBe(85);

      expect(fullStats.count).toBe(1);
      expect(fullStats.averageLevel).toBe(95);
    });
  });

  describe('Utility Operations', () => {
    beforeEach(async () => {
      await Container.create({
        containerId: 'UTIL001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should check if container exists', async () => {
      const exists = await containerRepository.exists('UTIL001');
      const notExists = await containerRepository.exists('NON_EXISTENT');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should perform bulk update operations', async () => {
      // Create additional containers
      await Container.create([
        {
          containerId: 'BULK001',
          containerType: 'organic',
          containerCapacity: 150
        },
        {
          containerId: 'BULK002',
          containerType: 'glass',
          containerCapacity: 80
        }
      ]);

      const updates = [
        {
          containerId: 'BULK001',
          updateData: { containerLevel: 75, status: 'Near Full' }
        },
        {
          containerId: 'BULK002',
          updateData: { containerLevel: 90, status: 'Near Full' }
        }
      ];

      const result = await containerRepository.bulkUpdate(updates);

      expect(result.modifiedCount).toBe(2);

      // Verify updates
      const bulk1 = await Container.findOne({ containerId: 'BULK001' });
      const bulk2 = await Container.findOne({ containerId: 'BULK002' });

      expect(bulk1.containerLevel).toBe(75);
      expect(bulk1.status).toBe('Near Full');
      expect(bulk2.containerLevel).toBe(90);
      expect(bulk2.status).toBe('Near Full');
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      const containers = [];
      for (let i = 1; i <= 15; i++) {
        containers.push({
          containerId: `PAGE${i.toString().padStart(3, '0')}`,
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: Math.floor(Math.random() * 101),
          status: 'Available'
        });
      }
      await Container.create(containers);
    });

    it('should find containers by status with pagination', async () => {
      const page1 = await containerRepository.findByStatusPaginated('Available', 1, 10);
      const page2 = await containerRepository.findByStatusPaginated('Available', 2, 10);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(5);

      // Should be sorted by container level descending
      for (let i = 0; i < page1.length - 1; i++) {
        expect(page1[i].containerLevel).toBeGreaterThanOrEqual(page1[i + 1].containerLevel);
      }
    });

    it('should handle empty results with pagination', async () => {
      const results = await containerRepository.findByStatusPaginated('Full', 1, 10);

      expect(results).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ObjectId gracefully', async () => {
      await expect(
        containerRepository.findById('invalid_objectid')
      ).rejects.toThrow();
    });

    it('should handle validation errors during creation', async () => {
      const invalidData = {
        containerId: 'INVALID001',
        containerType: 'invalid_type', // Invalid enum
        containerCapacity: 100
      };

      await expect(
        containerRepository.create(invalidData)
      ).rejects.toThrow();
    });

    it('should handle duplicate containerId error', async () => {
      const containerData = {
        containerId: 'DUPLICATE001',
        containerType: 'plastic',
        containerCapacity: 100
      };

      await containerRepository.create(containerData);

      await expect(
        containerRepository.create(containerData)
      ).rejects.toThrow();
    });
  });
});