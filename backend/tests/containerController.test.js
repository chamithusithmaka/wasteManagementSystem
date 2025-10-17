import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Container from '../models/Container.js';
import containerRoutes from '../routes/containerRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/containers', containerRoutes);

describe('Container Controller', () => {
  afterEach(async () => {
    await Container.deleteMany({});
  });

  describe('POST /api/containers', () => {
    it('should create a new container', async () => {
      const containerData = {
        containerId: 'API001',
        containerType: 'plastic',
        containerCapacity: 100
      };

      const response = await request(app)
        .post('/api/containers')
        .send(containerData)
        .expect(201);

      expect(response.body.containerId).toBe('API001');
      expect(response.body.containerType).toBe('plastic');
      expect(response.body.status).toBe('Available');
      expect(response.body.containerLevel).toBe(0);
    });

    it('should return 400 for duplicate containerId', async () => {
      const containerData = {
        containerId: 'DUPLICATE',
        containerType: 'plastic',
        containerCapacity: 100
      };

      // Create first container
      await request(app)
        .post('/api/containers')
        .send(containerData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/containers')
        .send(containerData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        containerId: 'INVALID001',
        containerType: 'invalid_type', // Invalid enum value
        containerCapacity: 100
      };

      await request(app)
        .post('/api/containers')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/containers', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'GET001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: {
            address: '123 Main St',
            city: 'Colombo',
            province: 'Western Province'
          }
        },
        {
          containerId: 'GET002',
          containerType: 'organic',
          containerCapacity: 150,
          status: 'Full',
          containerLevel: 95
        }
      ]);
    });

    it('should get all containers', async () => {
      const response = await request(app)
        .get('/api/containers')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map(c => c.containerId)).toContain('GET001');
      expect(response.body.map(c => c.containerId)).toContain('GET002');
    });

    it('should normalize container location fields', async () => {
      const response = await request(app)
        .get('/api/containers')
        .expect(200);

      response.body.forEach(container => {
        expect(container.containerLocation).toBeDefined();
        expect(container.containerLocation).toHaveProperty('address');
        expect(container.containerLocation).toHaveProperty('city');
        expect(container.containerLocation).toHaveProperty('province');
        expect(container.containerLocation).toHaveProperty('coordinates');
      });
    });
  });

  describe('GET /api/containers/:id', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'GETBYID001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should get container by containerId', async () => {
      const response = await request(app)
        .get('/api/containers/GETBYID001')
        .expect(200);

      expect(response.body.containerId).toBe('GETBYID001');
      expect(response.body.containerType).toBe('plastic');
    });

    it('should return 404 for non-existent container', async () => {
      const response = await request(app)
        .get('/api/containers/NON_EXISTENT')
        .expect(404);

      expect(response.body.message).toBe('Container not found');
    });
  });

  describe('GET /api/containers/status/:status', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'STATUS001',
          containerType: 'plastic',
          containerCapacity: 100,
          status: 'Available'
        },
        {
          containerId: 'STATUS002',
          containerType: 'organic',
          containerCapacity: 150,
          status: 'Full'
        },
        {
          containerId: 'STATUS003',
          containerType: 'glass',
          containerCapacity: 80,
          status: 'Available'
        }
      ]);
    });

    it('should get containers by status', async () => {
      const response = await request(app)
        .get('/api/containers/status/Available')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map(c => c.containerId)).toContain('STATUS001');
      expect(response.body.map(c => c.containerId)).toContain('STATUS003');
    });

    it('should return empty array for status with no containers', async () => {
      const response = await request(app)
        .get('/api/containers/status/Needs%20Maintenance')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/containers/errors', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'ERROR001',
          containerType: 'plastic',
          containerCapacity: 100,
          isErrorDetected: true,
          status: 'Needs Maintenance'
        },
        {
          containerId: 'ERROR002',
          containerType: 'organic',
          containerCapacity: 150,
          isErrorDetected: false,
          status: 'Available'
        }
      ]);
    });

    it('should get containers with errors', async () => {
      const response = await request(app)
        .get('/api/containers/errors')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].containerId).toBe('ERROR001');
      expect(response.body[0].isErrorDetected).toBe(true);
    });
  });

  describe('GET /api/containers/province/:province', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'PROVINCE001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: { province: 'Western Province', city: 'Colombo' }
        },
        {
          containerId: 'PROVINCE002',
          containerType: 'organic',
          containerCapacity: 150,
          containerLocation: { province: 'Central Province', city: 'Kandy' }
        }
      ]);
    });

    it('should get containers by province', async () => {
      const response = await request(app)
        .get('/api/containers/province/Western%20Province')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].containerId).toBe('PROVINCE001');
    });
  });

  describe('PUT /api/containers/:id', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'UPDATE001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 50
      });
    });

    it('should update container', async () => {
      const updateData = {
        containerLevel: 85
      };

      const response = await request(app)
        .put('/api/containers/UPDATE001')
        .send(updateData)
        .expect(200);

      expect(response.body.containerLevel).toBe(85);
      expect(response.body.status).toBe('Near Full');
    });

    it('should return 404 for non-existent container', async () => {
      const updateData = { containerLevel: 75 };

      const response = await request(app)
        .put('/api/containers/NON_EXISTENT')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Container not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        containerLevel: 150 // Invalid level > 100
      };

      await request(app)
        .put('/api/containers/UPDATE001')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/containers/:id/location', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'LOCATION001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should update container location', async () => {
      const locationData = {
        address: '123 Test Street',
        city: 'Colombo',
        province: 'Western Province'
      };

      const response = await request(app)
        .put('/api/containers/LOCATION001/location')
        .send(locationData)
        .expect(200);

      expect(response.body.message).toBe('Location updated locally (upstream API unavailable)');
      expect(response.body.localUpdate.containerLocation.address).toBe('123 Test Street');
      expect(response.body.localUpdate.containerLocation.city).toBe('Colombo');
    });

    it('should work with MongoDB ObjectId', async () => {
      const locationData = {
        address: '456 Another Street',
        city: 'Kandy'
      };

      const response = await request(app)
        .put(`/api/containers/${container._id}/location`)
        .send(locationData)
        .expect(200);

      expect(response.body.localUpdate.containerLocation.address).toBe('456 Another Street');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        address: '123 Test Street'
        // Missing city
      };

      const response = await request(app)
        .put('/api/containers/LOCATION001/location')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Request body must include address and city');
    });
  });

  describe('GET /api/containers/:id/location-assigned', () => {
    beforeEach(async () => {
      await Container.create([
        {
          containerId: 'ASSIGNED001',
          containerType: 'plastic',
          containerCapacity: 100,
          containerLocation: {
            address: '123 Main Street',
            city: 'Colombo'
          }
        },
        {
          containerId: 'ASSIGNED002',
          containerType: 'organic',
          containerCapacity: 150
          // No location
        }
      ]);
    });

    it('should return true for container with assigned location', async () => {
      const response = await request(app)
        .get('/api/containers/ASSIGNED001/location-assigned')
        .expect(200);

      expect(response.body.containerId).toBe('ASSIGNED001');
      expect(response.body.isLocationAssigned).toBe(true);
    });

    it('should return false for container without assigned location', async () => {
      const response = await request(app)
        .get('/api/containers/ASSIGNED002/location-assigned')
        .expect(200);

      expect(response.body.containerId).toBe('ASSIGNED002');
      expect(response.body.isLocationAssigned).toBe(false);
    });

    it('should return 500 for non-existent container', async () => {
      await request(app)
        .get('/api/containers/NON_EXISTENT/location-assigned')
        .expect(500);
    });
  });

  describe('PUT /api/containers/:id/deactivate', () => {
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

    it('should deactivate container with containerId', async () => {
      const response = await request(app)
        .put('/api/containers/DEACTIVATE001/deactivate')
        .expect(200);

      expect(response.body.message).toBe('Container deactivated successfully');
      expect(response.body.container.status).toBe('Out of Service');
      expect(response.body.container.containerLevel).toBe(0);
      expect(response.body.container.isErrorDetected).toBe(false);
    });

    it('should deactivate container with MongoDB ObjectId', async () => {
      const response = await request(app)
        .put(`/api/containers/${container._id}/deactivate`)
        .expect(200);

      expect(response.body.container.status).toBe('Out of Service');
      expect(response.body.container.containerLevel).toBe(0);
    });

    it('should return 500 for non-existent container', async () => {
      await request(app)
        .put('/api/containers/NON_EXISTENT/deactivate')
        .expect(500);
    });
  });

  describe('PUT /api/containers/:id/reactivate', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'REACTIVATE001',
        containerType: 'plastic',
        containerCapacity: 100,
        status: 'Out of Service',
        containerLevel: 0,
        isErrorDetected: false
      });
    });

    it('should reactivate deactivated container', async () => {
      const response = await request(app)
        .put('/api/containers/REACTIVATE001/reactivate')
        .expect(200);

      expect(response.body.message).toBe('Container reactivated successfully');
      expect(response.body.container.status).toBe('Available');
      expect(response.body.container.isErrorDetected).toBe(false);
    });

    it('should return 500 for container not in deactivated state', async () => {
      // First change to non-deactivated state
      await Container.findOneAndUpdate(
        { containerId: 'REACTIVATE001' },
        { status: 'Available', isErrorDetected: true }
      );

      await request(app)
        .put('/api/containers/REACTIVATE001/reactivate')
        .expect(500);
    });
  });

  describe('PUT /api/containers/:id/schedule-collection', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'SCHEDULE001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLevel: 85,
        status: 'Near Full'
      });
    });

    it('should schedule collection for container', async () => {
      const response = await request(app)
        .put('/api/containers/SCHEDULE001/schedule-collection')
        .expect(200);

      expect(response.body.message).toBe('Collection scheduled successfully');
      expect(response.body.container.status).toBe('Scheduled for Collection');
      expect(response.body.container.collectionSchedule).toBeDefined();
    });

    it('should return 404 for non-existent container', async () => {
      await request(app)
        .put('/api/containers/NON_EXISTENT/schedule-collection')
        .expect(404);
    });
  });

  describe('DELETE /api/containers/:id', () => {
    let container;

    beforeEach(async () => {
      container = await Container.create({
        containerId: 'DELETE001',
        containerType: 'plastic',
        containerCapacity: 100
      });
    });

    it('should delete container', async () => {
      const response = await request(app)
        .delete('/api/containers/DELETE001')
        .expect(200);

      expect(response.body.message).toBe('Container deleted successfully');

      // Verify container is deleted
      const found = await Container.findOne({ containerId: 'DELETE001' });
      expect(found).toBeNull();
    });

    it('should return 500 for non-existent container', async () => {
      await request(app)
        .delete('/api/containers/NON_EXISTENT')
        .expect(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Simulate database error by closing connection temporarily
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/containers')
        .expect(500);

      expect(response.body.error).toBeDefined();

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/containers')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/containers/invalid_objectid_format')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    beforeEach(async () => {
      await Container.create({
        containerId: 'FORMAT001',
        containerType: 'plastic',
        containerCapacity: 100,
        containerLocation: {
          address: '123 Test St',
          city: 'Colombo'
        }
      });
    });

    it('should always include containerLocation fields in normalized responses', async () => {
      const response = await request(app)
        .get('/api/containers')
        .expect(200);

      response.body.forEach(container => {
        expect(container.containerLocation).toBeDefined();
        expect(container.containerLocation).toHaveProperty('address');
        expect(container.containerLocation).toHaveProperty('city');
        expect(container.containerLocation).toHaveProperty('province');
        expect(container.containerLocation).toHaveProperty('coordinates');
      });
    });

    it('should handle missing containerLocation gracefully', async () => {
      // Create container without location
      await Container.create({
        containerId: 'FORMAT002',
        containerType: 'organic',
        containerCapacity: 150
      });

      const response = await request(app)
        .get('/api/containers/status/Available')
        .expect(200);

      const containerWithoutLocation = response.body.find(c => c.containerId === 'FORMAT002');
      expect(containerWithoutLocation.containerLocation.address).toBeNull();
      expect(containerWithoutLocation.containerLocation.city).toBeNull();
      expect(containerWithoutLocation.containerLocation.province).toBeNull();
    });
  });
});