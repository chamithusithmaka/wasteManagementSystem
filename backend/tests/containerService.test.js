import mongoose from 'mongoose';
import Container from '../models/Container.js';
import containerService from '../services/containerService.js';

describe('Container Service', () => {
  afterEach(async () => {
    await Container.deleteMany({});
  });

  describe('Container Creation', () => {
    it('should create a new container', async () => {
      const containerData = {
        containerId: 'SERVICE001',
        containerType: 'plastic',
        containerCapacity: 100
      };

      const container = await containerService.createContainer(containerData);

      expect(container.containerId).toBe('SERVICE001');
      expect(container.containerType).toBe('plastic');
      expect(container.status).toBe('Available');
      expect(container.containerLevel).toBe(0);
    });

    it('should auto-set status to Full for high level', async () => {
      const containerData = {
        containerId: 'SERVICE002',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 95
      };

      const container = await containerService.createContainer(containerData);

      expect(container.status).toBe('Full');
      expect(container.containerLevel).toBe(95);
    });

    it('should throw error for duplicate containerId', async () => {
      const containerData = {
        containerId: 'DUPLICATE',
        containerType: 'plastic',
        containerCapacity: 100
      };

      await containerService.createContainer(containerData);

      await expect(
        containerService.createContainer(containerData)
      ).rejects.toThrow('Container with ID DUPLICATE already exists');
    });
  });

  describe('Container Retrieval', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'RETRIEVE001',
          containerType: 'plastic',
          containerCapacity: 100,
          status: 'Available',
          containerLocation: { city: 'Colombo', province: 'Western Province' }
        },
        {
          containerId: 'RETRIEVE002',
          containerType: 'organic',
          containerCapacity: 150,
          status: 'Full',
          containerLevel: 95,
          isErrorDetected: true,
          containerLocation: { city: 'Kandy', province: 'Central Province' }
        }
      ]);
    });

    it('should get container by containerId', async () => {
      const container = await containerService.getContainerById('RETRIEVE001');

      expect(container).toBeTruthy();
      expect(container.containerId).toBe('RETRIEVE001');
      expect(container.containerType).toBe('plastic');
    });

    it('should return null for non-existent containerId', async () => {
      const container = await containerService.getContainerById('NON_EXISTENT');

      expect(container).toBeNull();
    });

    it('should get container by MongoDB ObjectId', async () => {
      const savedContainer = await Container.findOne({ containerId: 'RETRIEVE001' });
      const container = await containerService.getContainerByMongoId(savedContainer._id.toString());

      expect(container).toBeTruthy();
      expect(container.containerId).toBe('RETRIEVE001');
    });

    it('should get all containers', async () => {
      const containers = await containerService.getAllContainers();

      expect(containers).toHaveLength(2);
      expect(containers.map(c => c.containerId)).toContain('RETRIEVE001');
      expect(containers.map(c => c.containerId)).toContain('RETRIEVE002');
    });

    it('should get containers by status', async () => {
      const availableContainers = await containerService.getContainersByStatus('Available');
      const fullContainers = await containerService.getContainersByStatus('Full');

      expect(availableContainers).toHaveLength(1);
      expect(availableContainers[0].containerId).toBe('RETRIEVE001');
      expect(fullContainers).toHaveLength(1);
      expect(fullContainers[0].containerId).toBe('RETRIEVE002');
    });

    it('should get containers by type', async () => {
      const plasticContainers = await containerService.getContainersByType('plastic');
      const organicContainers = await containerService.getContainersByType('organic');

      expect(plasticContainers).toHaveLength(1);
      expect(plasticContainers[0].containerId).toBe('RETRIEVE001');
      expect(organicContainers).toHaveLength(1);
      expect(organicContainers[0].containerId).toBe('RETRIEVE002');
    });

    it('should get containers by city', async () => {
      const colomboContainers = await containerService.getContainersByCity('Colombo');

      expect(colomboContainers).toHaveLength(1);
      expect(colomboContainers[0].containerId).toBe('RETRIEVE001');
    });

    it('should get containers by province', async () => {
      const westernContainers = await containerService.getContainersByProvince('Western Province');

      expect(westernContainers).toHaveLength(1);
      expect(westernContainers[0].containerId).toBe('RETRIEVE001');
    });

    it('should get containers with errors', async () => {
      const errorContainers = await containerService.getContainersWithErrors();

      expect(errorContainers).toHaveLength(1);
      expect(errorContainers[0].containerId).toBe('RETRIEVE002');
      expect(errorContainers[0].isErrorDetected).toBe(true);
    });

    it('should get containers needing collection', async () => {
      const needingCollection = await containerService.getContainersNeedingCollection(80);

      expect(needingCollection).toHaveLength(1);
      expect(needingCollection[0].containerId).toBe('RETRIEVE002');
    });
  });

  describe('Container Update', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'UPDATE001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 45,
        status: 'Available'
      });
    });

    it('should update container level and auto-update status', async () => {
      const updated = await containerService.updateContainer('UPDATE001', {
        containerLevel: 85
      });

      expect(updated.containerLevel).toBe(85);
      expect(updated.status).toBe('Near Full');
    });

    it('should set status to Full for level >= 95', async () => {
      const updated = await containerService.updateContainer('UPDATE001', {
        containerLevel: 95
      });

      expect(updated.containerLevel).toBe(95);
      expect(updated.status).toBe('Full');
    });

    it('should set status to Available for level < 80', async () => {
      // First set to high level
      await containerService.updateContainer('UPDATE001', { containerLevel: 90 });
      
      // Then reduce level
      const updated = await containerService.updateContainer('UPDATE001', {
        containerLevel: 70
      });

      expect(updated.containerLevel).toBe(70);
      expect(updated.status).toBe('Available');
    });

    it('should set status to Needs Maintenance when error detected', async () => {
      const updated = await containerService.updateContainer('UPDATE001', {
        isErrorDetected: true
      });

      expect(updated.isErrorDetected).toBe(true);
      expect(updated.status).toBe('Needs Maintenance');
    });

    it('should set error flag when marking as Out of Service', async () => {
      const updated = await containerService.updateContainer('UPDATE001', {
        status: 'Out of Service'
      });

      expect(updated.status).toBe('Out of Service');
      expect(updated.isErrorDetected).toBe(true);
    });

    it('should allow deactivation without error flag', async () => {
      const updated = await containerService.updateContainer('UPDATE001', {
        status: 'Out of Service',
        isErrorDetected: false
      });

      expect(updated.status).toBe('Out of Service');
      expect(updated.isErrorDetected).toBe(false);
    });

    it('should return null for non-existent container', async () => {
      const updated = await containerService.updateContainer('NON_EXISTENT', {
        containerLevel: 50
      });

      expect(updated).toBeNull();
    });
  });

  describe('Container Level Update', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'LEVEL001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should update container level with validation', async () => {
      const updated = await containerService.updateContainerLevel('LEVEL001', 75);

      expect(updated.containerLevel).toBe(75);
    });

    it('should throw error for level below 0', async () => {
      await expect(
        containerService.updateContainerLevel('LEVEL001', -5)
      ).rejects.toThrow('Container level must be between 0 and 100');
    });

    it('should throw error for level above 100', async () => {
      await expect(
        containerService.updateContainerLevel('LEVEL001', 105)
      ).rejects.toThrow('Container level must be between 0 and 100');
    });
  });

  describe('Container Status Update', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'STATUS001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should update container status', async () => {
      const updated = await containerService.updateContainerStatus('STATUS001', 'Full');

      expect(updated.status).toBe('Full');
    });

    it('should throw error for invalid status', async () => {
      await expect(
        containerService.updateContainerStatus('STATUS001', 'Invalid Status')
      ).rejects.toThrow('Status must be one of:');
    });

    it('should accept all valid statuses', async () => {
      const validStatuses = [
        'Available', 
        'Near Full', 
        'Full', 
        'Needs Maintenance', 
        'Out of Service',
        'Scheduled for Collection'
      ];

      for (const status of validStatuses) {
        const updated = await containerService.updateContainerStatus('STATUS001', status);
        expect(updated.status).toBe(status);
      }
    });
  });

  describe('Container Deactivation and Reactivation', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'DEACTIVATE001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 75,
        status: 'Available'
      });
    });

    it('should deactivate container with business containerId', async () => {
      const deactivated = await containerService.deactivateContainer('DEACTIVATE001');

      expect(deactivated.status).toBe('Out of Service');
      expect(deactivated.containerLevel).toBe(0);
      expect(deactivated.isErrorDetected).toBe(false);
    });

    it('should deactivate container with MongoDB ObjectId', async () => {
      const mongoId = container._id.toString();
      const deactivated = await containerService.deactivateContainer(mongoId);

      expect(deactivated.status).toBe('Out of Service');
      expect(deactivated.containerLevel).toBe(0);
      expect(deactivated.isErrorDetected).toBe(false);
    });

    it('should reactivate deactivated container', async () => {
      // First deactivate
      await containerService.deactivateContainer('DEACTIVATE001');
      
      // Then reactivate
      const reactivated = await containerService.reactivateContainer('DEACTIVATE001');

      expect(reactivated.status).toBe('Available');
      expect(reactivated.isErrorDetected).toBe(false);
    });

    it('should throw error when reactivating non-deactivated container', async () => {
      await expect(
        containerService.reactivateContainer('DEACTIVATE001')
      ).rejects.toThrow('Container DEACTIVATE001 is not in deactivated state');
    });

    it('should throw error for non-existent container', async () => {
      await expect(
        containerService.deactivateContainer('NON_EXISTENT')
      ).rejects.toThrow('Container NON_EXISTENT not found');
    });
  });

  describe('Location Assignment Check', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'LOCATION001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: {
            address: '123 Main Street',
            city: 'Colombo',
            province: 'Western Province'
          }
        },
        {
          containerId: 'LOCATION002',
          containerType: 'organic',
          containerCapacity: 150,
          containerLocation: {
            address: '456 Side Road'
            // No city
          }
        },
        {
          containerId: 'LOCATION003',
          containerType: 'glass',
          containerCapacity: 80
          // No location at all
        }
      ]);
    });

    it('should return true for container with address and city', async () => {
      const isAssigned = await containerService.isLocationAssigned('LOCATION001');
      expect(isAssigned).toBe(true);
    });

    it('should return false for container with address but no city', async () => {
      const isAssigned = await containerService.isLocationAssigned('LOCATION002');
      expect(isAssigned).toBe(false);
    });

    it('should return false for container with no location', async () => {
      const isAssigned = await containerService.isLocationAssigned('LOCATION003');
      expect(isAssigned).toBe(false);
    });

    it('should work with MongoDB ObjectId', async () => {
      const container = await Container.findOne({ containerId: 'LOCATION001' });
      const isAssigned = await containerService.isLocationAssigned(container._id.toString());
      expect(isAssigned).toBe(true);
    });

    it('should throw error for non-existent container', async () => {
      await expect(
        containerService.isLocationAssigned('NON_EXISTENT')
      ).rejects.toThrow('Container NON_EXISTENT not found');
    });
  });

  describe('Collection Operations', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'COLLECTION001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 95,
        status: 'Full'
      });
    });

    it('should record collection event', async () => {
      const collectionDate = new Date('2025-10-18T10:00:00Z');
      const collected = await containerService.recordCollection('COLLECTION001', collectionDate);

      expect(collected.containerLevel).toBe(0);
      expect(collected.status).toBe('Available');
      expect(collected.lastCollectionDate).toEqual(collectionDate);
    });

    it('should schedule collection for container', async () => {
      const scheduled = await containerService.scheduleContainerCollection('COLLECTION001');

      expect(scheduled.status).toBe('Scheduled for Collection');
      expect(scheduled.collectionSchedule).toBeDefined();
      expect(scheduled.collectionSchedule.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error when collecting from Out of Service container', async () => {
      await containerService.updateContainer('COLLECTION001', { status: 'Out of Service' });

      await expect(
        containerService.recordCollection('COLLECTION001')
      ).rejects.toThrow('Cannot collect from Out of Service container');
    });
  });

  describe('Maintenance Operations', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'MAINTENANCE001',
        containerType: 'plastic',
        containerCapacity: 100,
        status: 'Available'
      });
    });

    it('should mark container for maintenance', async () => {
      const marked = await containerService.markForMaintenance('MAINTENANCE001', 'Sensor malfunction');

      expect(marked.status).toBe('Needs Maintenance');
      expect(marked.isErrorDetected).toBe(true);
    });

    it('should complete maintenance', async () => {
      // First mark for maintenance
      await containerService.markForMaintenance('MAINTENANCE001', 'Test issue');
      
      // Then complete maintenance
      const completed = await containerService.completeMaintenance('MAINTENANCE001');

      expect(completed.status).toBe('Available');
      expect(completed.isErrorDetected).toBe(false);
    });
  });

  describe('Container Deletion', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'DELETE001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should delete existing container', async () => {
      const deleted = await containerService.deleteContainer('DELETE001');

      expect(deleted.containerId).toBe('DELETE001');
      
      // Verify it's actually deleted
      const found = await Container.findOne({ containerId: 'DELETE001' });
      expect(found).toBeNull();
    });

    it('should throw error when deleting non-existent container', async () => {
      await expect(
        containerService.deleteContainer('NON_EXISTENT')
      ).rejects.toThrow('Container NON_EXISTENT not found');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'STATS001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: 85,
          status: 'Near Full'
        },
        {
          containerId: 'STATS002',
          containerType: 'plastic',
          containerCapacity: 150,
          containerLevel: 95,
          status: 'Full'
        },
        {
          containerId: 'STATS003',
          containerType: 'organic',
          containerCapacity: 120,
          containerLevel: 40,
          status: 'Available',
          isErrorDetected: true
        }
      ]);
    });

    it('should get overall statistics', async () => {
      const stats = await containerService.getStatistics();

      expect(stats.totalContainers).toBe(3);
      expect(stats.averageLevel).toBeCloseTo(73.33, 1); // (85 + 95 + 40) / 3
      expect(stats.totalCapacity).toBe(370); // 100 + 150 + 120
      expect(stats.containersNearFull).toBe(2); // level >= 80
      expect(stats.containersFull).toBe(1); // level >= 95
      expect(stats.containersWithErrors).toBe(1);
    });

    it('should get statistics by type', async () => {
      const statsByType = await containerService.getStatisticsByType();

      expect(statsByType).toHaveLength(2);
      
      const plasticStats = statsByType.find(s => s._id === 'plastic');
      const organicStats = statsByType.find(s => s._id === 'organic');

      expect(plasticStats.count).toBe(2);
      expect(plasticStats.averageLevel).toBe(90); // (85 + 95) / 2
      expect(organicStats.count).toBe(1);
      expect(organicStats.averageLevel).toBe(40);
    });

    it('should get statistics by status', async () => {
      const statsByStatus = await containerService.getStatisticsByStatus();

      expect(statsByStatus).toHaveLength(3);
      expect(statsByStatus.find(s => s._id === 'Available').count).toBe(1);
      expect(statsByStatus.find(s => s._id === 'Near Full').count).toBe(1);
      expect(statsByStatus.find(s => s._id === 'Full').count).toBe(1);
    });
  });
});