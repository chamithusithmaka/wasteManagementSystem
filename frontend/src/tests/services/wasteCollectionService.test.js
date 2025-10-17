import WasteCollectionService from '../../services/wasteCollectionService';
import { getAuthToken } from '../../utils/authUtils';

// Mock dependencies
jest.mock('../../utils/authUtils');

// Mock fetch
global.fetch = jest.fn();

describe('WasteCollectionService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup auth token mock
    getAuthToken.mockReturnValue('mock-token');
    
    // Setup fetch mock with default success response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' })
    });
  });

  describe('schedulePickup', () => {
    test('calls API with correct parameters', async () => {
      const pickupData = {
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables',
        scheduledDate: '2025-10-25',
        scheduledTime: '10:00',
        notes: 'Test notes',
        containerFillLevel: 75
      };
      
      await WasteCollectionService.schedulePickup(pickupData);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/schedule',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(pickupData)
        })
      );
    });
    
    test('throws error when API call fails', async () => {
      // Mock API failure
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Failed to schedule pickup' })
      });
      
      const pickupData = {
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables',
        scheduledDate: '2025-10-25',
        scheduledTime: '10:00'
      };
      
      await expect(WasteCollectionService.schedulePickup(pickupData)).rejects.toThrow('Failed to schedule pickup');
    });
  });
  
  describe('getUserPickups', () => {
    test('calls API with correct status filter', async () => {
      await WasteCollectionService.getUserPickups('Scheduled');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/my-pickups?status=Scheduled',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        })
      );
    });
    
    test('returns mapped pickup data', async () => {
      // Mock specific response for this test
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 
          pickups: [
            {
              _id: '123',
              wasteType: 'Recyclables',
              scheduledDate: '2025-10-25T00:00:00.000Z',
              scheduledTime: '10:00',
              address: '123 Test St',
              province: 'Western',
              status: 'Scheduled',
              confirmationId: 'RC-12345'
            }
          ]
        })
      });
      
      const result = await WasteCollectionService.getUserPickups();
      
      expect(result[0]).toEqual(expect.objectContaining({
        id: '123',
        type: 'Recyclables',
        date: '2025-10-25T00:00:00.000Z',
        time: '10:00',
        address: '123 Test St',
        province: 'Western',
        status: 'Scheduled',
        confirmationId: 'RC-12345'
      }));
    });
  });
  
  describe('getUserStats', () => {
    test('calls API and returns stats', async () => {
      // Mock specific response
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 
          stats: {
            completedThisMonth: 5,
            upcomingPickups: 2,
            avgFill: 75
          }
        })
      });
      
      const result = await WasteCollectionService.getUserStats();
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/stats',
        expect.any(Object)
      );
      
      expect(result).toEqual({
        completedThisMonth: 5,
        upcomingPickups: 2,
        avgFill: 75
      });
    });
  });
  
  describe('getAllPickups (admin)', () => {
    test('calls admin API with pagination', async () => {
      await WasteCollectionService.getAllPickups('Scheduled', 2, 10);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/admin/all?page=2&limit=10&status=Scheduled',
        expect.any(Object)
      );
    });
  });
  
  describe('assignStaff (admin)', () => {
    test('calls admin API with staff name', async () => {
      await WasteCollectionService.assignStaff('123', 'John Doe');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/admin/123/assign',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ staffName: 'John Doe' })
        })
      );
    });
  });
  
  describe('completePickup (admin)', () => {
    test('calls admin API with waste amount', async () => {
      await WasteCollectionService.completePickup('123', 25);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/waste-collection/admin/123/complete',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ wasteAmount: 25 })
        })
      );
    });
  });
  
  describe('data mapping', () => {
    test('correctly maps backend pickup to frontend format', () => {
      const backendPickup = {
        _id: '123',
        wasteType: 'Recyclables',
        scheduledDate: '2025-10-25',
        scheduledTime: '10:00',
        address: '123 Test St',
        province: 'Western',
        notes: 'Test notes',
        status: 'Scheduled',
        confirmationId: 'RC-12345',
        containerFillLevel: 75
      };
      
      const result = WasteCollectionService.mapPickupToFrontend(backendPickup);
      
      expect(result).toEqual({
        id: '123',
        type: 'Recyclables',
        date: '2025-10-25',
        time: '10:00',
        address: '123 Test St',
        province: 'Western',
        notes: 'Test notes',
        status: 'Scheduled',
        confirmationId: 'RC-12345',
        containerFillLevel: 75
      });
    });
    
    test('correctly maps frontend pickup to backend format', () => {
      const frontendPickup = {
        id: '123',
        type: 'Recyclables',
        date: '2025-10-25',
        time: '10:00',
        address: '123 Test St',
        province: 'Western',
        notes: 'Test notes',
        containerFillLevel: 75
      };
      
      const result = WasteCollectionService.mapPickupToBackend(frontendPickup);
      
      expect(result).toEqual({
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables',
        scheduledDate: '2025-10-25',
        scheduledTime: '10:00',
        notes: 'Test notes',
        containerFillLevel: 75
      });
    });
  });
});