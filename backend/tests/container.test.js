import mongoose from 'mongoose';
import Container from '../models/Container.js';

describe('Container Model', () => {
  afterEach(async () => {
    await Container.deleteMany({});
  });

  describe('Container Creation', () => {
    it('should create a container with default values', async () => {
      const container = await Container.create({
        containerId: 'TEST001',
        containerType: 'plastic',
        containerCapacity: 100
      });
      
      expect(container.containerId).toBe('TEST001');
      expect(container.containerType).toBe('plastic');
      expect(container.containerLevel).toBe(0);
      expect(container.status).toBe('Available');
      expect(container.isErrorDetected).toBe(false);
      expect(container.installationDate).toBeDefined();
    });

    it('should create a container with location', async () => {
      const container = await Container.create({
        containerId: 'TEST002',
        containerType: 'organic',
        containerCapacity: 150,
        containerLocation: {
          address: '123 Main Street',
          city: 'Colombo',
          province: 'Western Province',
          coordinates: {
            latitude: 6.9271,
            longitude: 79.8612
          }
        }
      });
      
      expect(container.containerLocation.address).toBe('123 Main Street');
      expect(container.containerLocation.city).toBe('Colombo');
      expect(container.containerLocation.province).toBe('Western Province');
      expect(container.containerLocation.coordinates.latitude).toBe(6.9271);
    });

    it('should validate container type enum', async () => {
      await expect(
        Container.create({
          containerId: 'TEST003',
          containerType: 'invalid_type',
          containerCapacity: 100
        })
      ).rejects.toThrow();
    });

    it('should validate province enum', async () => {
      await expect(
        Container.create({
          containerId: 'TEST004',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: {
            province: 'Invalid Province'
          }
        })
      ).rejects.toThrow();
    });

    it('should validate unique containerId', async () => {
      await Container.create({
        containerId: 'DUPLICATE001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      await expect(
        Container.create({
          containerId: 'DUPLICATE001',
          containerType: 'organic',
          containerCapacity: 150
        })
      ).rejects.toThrow();
    });
  });

  describe('Container Level and Status', () => {
    it('should update container level', async () => {
      const container = await Container.create({
        containerId: 'LEVEL001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      container.containerLevel = 75;
      await container.save();

      expect(container.containerLevel).toBe(75);
    });

    it('should validate level range', async () => {
      const container = new Container({
        containerId: 'LEVEL002',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 150
      });

      await expect(container.save()).rejects.toThrow();
    });

    it('should update status', async () => {
      const container = await Container.create({
        containerId: 'STATUS001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      container.status = 'Full';
      await container.save();

      expect(container.status).toBe('Full');
    });

    it('should validate status enum', async () => {
      const container = new Container({
        containerId: 'STATUS002',
        containerType: 'plastic',
        containerCapacity: 100,
        status: 'Invalid Status'
      });

      await expect(container.save()).rejects.toThrow();
    });
  });

  describe('Container Error Detection', () => {
    it('should set error detection flag', async () => {
      const container = await Container.create({
        containerId: 'ERROR001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      container.isErrorDetected = true;
      await container.save();

      expect(container.isErrorDetected).toBe(true);
    });

    it('should handle error with status change', async () => {
      const container = await Container.create({
        containerId: 'ERROR002',
        containerType: 'plastic',
        containerCapacity: 100
      });

      container.isErrorDetected = true;
      container.status = 'Needs Maintenance';
      await container.save();

      expect(container.isErrorDetected).toBe(true);
      expect(container.status).toBe('Needs Maintenance');
    });
  });

  describe('Container Dates and Schedule', () => {
    it('should set collection schedule', async () => {
      const container = await Container.create({
        containerId: 'SCHEDULE001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      const scheduleDate = new Date('2025-10-20T09:00:00Z');
      container.collectionSchedule = scheduleDate;
      await container.save();

      expect(container.collectionSchedule).toEqual(scheduleDate);
    });

    it('should record last collection date', async () => {
      const container = await Container.create({
        containerId: 'COLLECTION001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      const collectionDate = new Date('2025-10-18T10:00:00Z');
      container.lastCollectionDate = collectionDate;
      container.containerLevel = 0;
      container.status = 'Available';
      await container.save();

      expect(container.lastCollectionDate).toEqual(collectionDate);
      expect(container.containerLevel).toBe(0);
      expect(container.status).toBe('Available');
    });

    it('should auto-update lastUpdatedDate', async () => {
      const container = await Container.create({
        containerId: 'UPDATE001',
        containerType: 'plastic',
        containerCapacity: 100
      });

      const originalDate = container.lastUpdatedDate;
      
      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      container.containerLevel = 50;
      await container.save();

      expect(container.lastUpdatedDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });

  describe('Container Location Features', () => {
    it('should handle partial location data', async () => {
      const container = await Container.create({
        containerId: 'LOCATION001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLocation: {
          address: '456 Test Road',
          city: 'Kandy'
          // No province or coordinates
        }
      });

      expect(container.containerLocation.address).toBe('456 Test Road');
      expect(container.containerLocation.city).toBe('Kandy');
      expect(container.containerLocation.province).toBeUndefined();
    });

    it('should validate coordinate ranges', async () => {
      await expect(
        Container.create({
          containerId: 'COORD001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: {
            coordinates: {
              latitude: 95, // Invalid latitude > 90
              longitude: 79.8612
            }
          }
        })
      ).rejects.toThrow();
    });
  });

  describe('Container Capacity', () => {
    it('should require positive capacity', async () => {
      await expect(
        Container.create({
          containerId: 'CAPACITY001',
          containerType: 'plastic',
          containerCapacity: -10
        })
      ).rejects.toThrow();
    });

    it('should allow zero capacity', async () => {
      const container = await Container.create({
        containerId: 'CAPACITY002',
        containerType: 'plastic',
        containerCapacity: 0
      });

      expect(container.containerCapacity).toBe(0);
    });
  });

  describe('Container Query Operations', () => {
    beforeEach(async () => {
      // Create test containers
      await Container.create([
        {
          containerId: 'QUERY001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: 85,
          status: 'Near Full',
          containerLocation: { city: 'Colombo', province: 'Western Province' }
        },
        {
          containerId: 'QUERY002',
          containerType: 'organic',
          containerCapacity: 150,
          containerLevel: 95,
          status: 'Full',
          containerLocation: { city: 'Kandy', province: 'Central Province' }
        },
        {
          containerId: 'QUERY003',
          containerType: 'glass',
          containerCapacity: 80,
          containerLevel: 30,
          status: 'Available',
          isErrorDetected: true,
          containerLocation: { city: 'Galle', province: 'Southern Province' }
        }
      ]);
    });

    it('should find containers by status', async () => {
      const fullContainers = await Container.find({ status: 'Full' });
      expect(fullContainers).toHaveLength(1);
      expect(fullContainers[0].containerId).toBe('QUERY002');
    });

    it('should find containers by type', async () => {
      const plasticContainers = await Container.find({ containerType: 'plastic' });
      expect(plasticContainers).toHaveLength(1);
      expect(plasticContainers[0].containerId).toBe('QUERY001');
    });

    it('should find containers by city', async () => {
      const colomboContainers = await Container.find({ 'containerLocation.city': 'Colombo' });
      expect(colomboContainers).toHaveLength(1);
      expect(colomboContainers[0].containerId).toBe('QUERY001');
    });

    it('should find containers by province', async () => {
      const westernContainers = await Container.find({ 'containerLocation.province': 'Western Province' });
      expect(westernContainers).toHaveLength(1);
      expect(westernContainers[0].containerId).toBe('QUERY001');
    });

    it('should find containers with errors', async () => {
      const errorContainers = await Container.find({ isErrorDetected: true });
      expect(errorContainers).toHaveLength(1);
      expect(errorContainers[0].containerId).toBe('QUERY003');
    });

    it('should find containers needing collection', async () => {
      const needingCollection = await Container.find({
        containerLevel: { $gte: 80 },
        status: { $in: ['Available', 'Near Full', 'Full'] }
      });
      expect(needingCollection).toHaveLength(2);
    });
  });

  describe('Container Aggregation', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'AGG001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: 75,
          status: 'Near Full'
        },
        {
          containerId: 'AGG002',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLevel: 95,
          status: 'Full'
        },
        {
          containerId: 'AGG003',
          containerType: 'organic',
          containerCapacity: 150,
          containerLevel: 50,
          status: 'Available'
        }
      ]);
    });

    it('should calculate average level by type', async () => {
      const stats = await Container.aggregate([
        {
          $group: {
            _id: '$containerType',
            avgLevel: { $avg: '$containerLevel' },
            count: { $sum: 1 }
          }
        }
      ]);

      const plasticStats = stats.find(s => s._id === 'plastic');
      const organicStats = stats.find(s => s._id === 'organic');

      expect(plasticStats.avgLevel).toBe(85); // (75 + 95) / 2
      expect(plasticStats.count).toBe(2);
      expect(organicStats.avgLevel).toBe(50);
      expect(organicStats.count).toBe(1);
    });

    it('should count containers by status', async () => {
      const statusCounts = await Container.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      expect(statusCounts).toHaveLength(3);
      expect(statusCounts.find(s => s._id === 'Available').count).toBe(1);
      expect(statusCounts.find(s => s._id === 'Near Full').count).toBe(1);
      expect(statusCounts.find(s => s._id === 'Full').count).toBe(1);
    });
  });
});