import mongoose from 'mongoose';
import WasteCollectionController from '../controllers/wasteCollectionController.js';
import WasteCollectionService from '../services/wasteCollectionService.js';
import Bill from '../models/Bill.js';
import { calculateAndCreateReward } from '../controllers/rewardController.js';
import BillService from '../services/billService.js';

// Simple mock function creator to use instead of jest.fn()
function createMockFn(returnValue) {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return returnValue;
  };
  mockFn.calls = [];
  mockFn.mockReturnValue = (value) => {
    returnValue = value;
    return mockFn;
  };
  mockFn.mockResolvedValue = (value) => {
    returnValue = Promise.resolve(value);
    return mockFn;
  };
  mockFn.mockImplementation = (impl) => {
    mockFn.implementation = impl;
    return mockFn;
  };
  return mockFn;
}

// Helper expect functions
const expect = {
  toHaveBeenCalledWith: (mockFn, ...expectedArgs) => {
    const wasCalled = mockFn.calls.some(args => 
      JSON.stringify(args) === JSON.stringify(expectedArgs)
    );
    if (!wasCalled) {
      throw new Error(`Expected function to be called with ${JSON.stringify(expectedArgs)}, but it wasn't`);
    }
  },
  toHaveBeenCalled: (mockFn) => {
    if (mockFn.calls.length === 0) {
      throw new Error('Expected function to be called, but it wasn\'t');
    }
  },
  objectContaining: (expected) => ({
    asymmetricMatch: (actual) => {
      for (const key in expected) {
        if (expected[key]?.asymmetricMatch) {
          if (!expected[key].asymmetricMatch(actual[key])) {
            return false;
          }
        } else if (actual[key] !== expected[key]) {
          return false;
        }
      }
      return true;
    }
  }),
  arrayContaining: (expected) => ({
    asymmetricMatch: (actual) => {
      return Array.isArray(actual) && expected.every(expectedItem => 
        actual.some(actualItem => {
          if (expectedItem?.asymmetricMatch) {
            return expectedItem.asymmetricMatch(actualItem);
          }
          return actualItem === expectedItem;
        })
      );
    }
  }),
  stringContaining: (expected) => ({
    asymmetricMatch: (actual) => {
      return typeof actual === 'string' && actual.includes(expected);
    }
  }),
  any: (type) => ({
    asymmetricMatch: (actual) => {
      if (type === Number) return typeof actual === 'number';
      if (type === String) return typeof actual === 'string';
      if (type === Date) return actual instanceof Date;
      return actual !== undefined && actual !== null;
    }
  })
};

// Test will run in isolation without affecting real database
describe('Waste Collection Flow', () => {
  // Mock data
  const mockUserId = new mongoose.Types.ObjectId();
  const mockPickupId = new mongoose.Types.ObjectId();
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    role: 'user'
  };
  
  const mockAdminUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'adminuser',
    role: 'admin'
  };
  
  // Mock request and response objects
  const mockRequest = (user = mockUser, body = {}, params = {}, query = {}) => ({
    user,
    body,
    params,
    query
  });
  
  const mockResponse = () => {
    const res = {};
    res.status = createMockFn(res);
    res.json = createMockFn(res);
    return res;
  };

  // Original service methods
  const originalServiceMethods = {
    createPickup: WasteCollectionService.createPickup,
    getUserPickups: WasteCollectionService.getUserPickups,
    getPickupById: WasteCollectionService.getPickupById,
    updatePickup: WasteCollectionService.updatePickup,
    cancelPickup: WasteCollectionService.cancelPickup,
    getUserStats: WasteCollectionService.getUserStats,
    getAllPickups: WasteCollectionService.getAllPickups,
    assignStaff: WasteCollectionService.assignStaff,
    completePickup: WasteCollectionService.completePickup
  };

  // Original dependencies
  const originalBillFindOne = Bill.findOne;
  const originalCalculateAndCreateReward = calculateAndCreateReward;
  const originalBillService = { ...BillService };

  // Setup mocks before tests
  beforeAll(() => {
    // Mock the services to avoid actual database calls
    WasteCollectionService.createPickup = async (pickupData) => ({ 
      _id: mockPickupId, 
      ...pickupData,
      confirmationId: 'RE-12345'
    });
    
    WasteCollectionService.getUserPickups = async () => [
      { 
        _id: mockPickupId, 
        userId: mockUserId,
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables',
        scheduledDate: new Date('2025-12-01'),
        scheduledTime: '10:00',
        status: 'Scheduled'
      }
    ];
    
    WasteCollectionService.getPickupById = async () => ({ 
      _id: mockPickupId, 
      userId: mockUserId,
      address: '123 Test St',
      province: 'Western',
      wasteType: 'Recyclables',
      scheduledDate: new Date('2025-12-01'),
      scheduledTime: '10:00',
      status: 'Scheduled',
      confirmationId: 'RE-12345'
    });
    
    WasteCollectionService.updatePickup = async (id, updates) => ({ 
      _id: mockPickupId, 
      userId: mockUserId,
      address: updates.address || '123 Test St',
      province: updates.province || 'Western',
      wasteType: updates.wasteType || 'Recyclables',
      scheduledDate: updates.scheduledDate || new Date('2025-12-01'),
      scheduledTime: updates.scheduledTime || '10:00',
      notes: updates.notes || '',
      status: 'Scheduled',
      confirmationId: 'RE-12345'
    });
    
    WasteCollectionService.cancelPickup = async () => ({ 
      _id: mockPickupId, 
      userId: mockUserId,
      address: '123 Test St',
      province: 'Western',
      wasteType: 'Recyclables',
      scheduledDate: new Date('2025-12-01'),
      scheduledTime: '10:00',
      status: 'Cancelled',
      confirmationId: 'RE-12345'
    });
    
    WasteCollectionService.getUserStats = async () => ({
      completedThisMonth: 5,
      upcomingPickups: 2,
      avgFill: 75
    });
    
    WasteCollectionService.getAllPickups = async () => ({
      pickups: [{ 
        _id: mockPickupId,
        userId: mockUserId,
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables',
        scheduledDate: new Date('2025-12-01'),
        scheduledTime: '10:00',
        status: 'Scheduled'
      }],
      totalPages: 1,
      currentPage: 1,
      total: 1
    });
    
    WasteCollectionService.assignStaff = async (id, staffName) => ({ 
      _id: mockPickupId, 
      userId: mockUserId,
      address: '123 Test St',
      province: 'Western',
      wasteType: 'Recyclables',
      scheduledDate: new Date('2025-12-01'),
      scheduledTime: '10:00',
      status: 'In Progress',
      assignedStaff: staffName,
      confirmationId: 'RE-12345'
    });
    
    WasteCollectionService.completePickup = async (id, { wasteAmount }) => ({ 
      _id: mockPickupId, 
      userId: mockUserId,
      address: '123 Test St',
      province: 'Western',
      wasteType: 'Recyclables',
      scheduledDate: new Date('2025-12-01'),
      scheduledTime: '10:00',
      status: 'Completed',
      wasteAmount: wasteAmount || 0,
      completedAt: new Date(),
      confirmationId: 'RE-12345'
    });

    // Mock external dependencies
    Bill.findOne = async () => null;
    
    // Mock reward calculation
    global.calculateAndCreateReward = async (pickup, wasteAmount, createdBy) => ({
      _id: new mongoose.Types.ObjectId(),
      residentId: pickup.userId,
      collectionId: pickup._id,
      type: pickup.wasteType,
      amount: wasteAmount * 2, // Simple calculation for test
      label: `${pickup.wasteType} (${wasteAmount}kg)`,
      createdBy
    });
    
    // Mock bill service
    global.BillService = {
      createBill: async (pickup, createdBy) => ({
        _id: new mongoose.Types.ObjectId(),
        userId: pickup.userId,
        collectionId: pickup._id,
        amount: 1000,
        status: 'Pending',
        createdBy
      })
    };
  });

  // Clean up after tests
  afterAll(() => {
    // Restore original methods
    WasteCollectionService.createPickup = originalServiceMethods.createPickup;
    WasteCollectionService.getUserPickups = originalServiceMethods.getUserPickups;
    WasteCollectionService.getPickupById = originalServiceMethods.getPickupById;
    WasteCollectionService.updatePickup = originalServiceMethods.updatePickup;
    WasteCollectionService.cancelPickup = originalServiceMethods.cancelPickup;
    WasteCollectionService.getUserStats = originalServiceMethods.getUserStats;
    WasteCollectionService.getAllPickups = originalServiceMethods.getAllPickups;
    WasteCollectionService.assignStaff = originalServiceMethods.assignStaff;
    WasteCollectionService.completePickup = originalServiceMethods.completePickup;
    
    Bill.findOne = originalBillFindOne;
  });

  // Tests for the complete waste management flow
  describe('Complete Waste Management Flow', () => {
    it('should handle the entire waste collection process from scheduling to completion', async () => {
      try {
        // Step 1: User schedules a pickup
        const scheduleReq = mockRequest(mockUser, {
          address: '123 Test St',
          province: 'Western',
          wasteType: 'Recyclables',
          scheduledDate: '2025-12-01',
          scheduledTime: '10:00',
          notes: 'Please collect before noon',
          containerFillLevel: 75
        });
        const scheduleRes = mockResponse();
        
        await WasteCollectionController.schedulePickup(scheduleReq, scheduleRes);
        
        expect.toHaveBeenCalledWith(scheduleRes.status, 201);
        
        // Step 2: User views their scheduled pickups
        const listReq = mockRequest(mockUser, {}, {}, { status: 'Scheduled' });
        const listRes = mockResponse();
        
        await WasteCollectionController.getUserPickups(listReq, listRes);
        
        expect.toHaveBeenCalledWith(listRes.status, 200);
        
        // Step 3: User views a specific pickup
        const viewReq = mockRequest(mockUser, {}, { id: mockPickupId });
        const viewRes = mockResponse();
        
        await WasteCollectionController.getPickup(viewReq, viewRes);
        
        expect.toHaveBeenCalledWith(viewRes.status, 200);
        
        // Step 4: User updates the pickup details
        const updateReq = mockRequest(mockUser, {
          notes: 'Updated notes',
          containerFillLevel: 85
        }, { id: mockPickupId });
        const updateRes = mockResponse();
        
        await WasteCollectionController.updatePickup(updateReq, updateRes);
        
        expect.toHaveBeenCalledWith(updateRes.status, 200);
        
        // Step 5: User checks their waste collection stats
        const statsReq = mockRequest(mockUser);
        const statsRes = mockResponse();
        
        await WasteCollectionController.getUserStats(statsReq, statsRes);
        
        expect.toHaveBeenCalledWith(statsRes.status, 200);
        
        // Step 6: Admin assigns staff to pickup
        // Update mock to return a "Scheduled" pickup
        WasteCollectionService.getPickupById = async () => ({ 
          _id: mockPickupId, 
          userId: mockUserId,
          address: '123 Test St',
          province: 'Western',
          wasteType: 'Recyclables',
          scheduledDate: new Date('2025-12-01'),
          scheduledTime: '10:00',
          status: 'Scheduled',
          confirmationId: 'RE-12345'
        });
        
        const assignReq = mockRequest(mockAdminUser, { staffName: 'John Doe' }, { id: mockPickupId });
        const assignRes = mockResponse();
        
        await WasteCollectionController.assignStaff(assignReq, assignRes);
        
        expect.toHaveBeenCalledWith(assignRes.status, 200);
        
        // Step 7: Admin completes the pickup
        // Update mock to return an "In Progress" pickup
        WasteCollectionService.getPickupById = async () => ({ 
          _id: mockPickupId, 
          userId: mockUserId,
          address: '123 Test St',
          province: 'Western',
          wasteType: 'Recyclables',
          scheduledDate: new Date('2025-12-01'),
          scheduledTime: '10:00',
          status: 'In Progress',
          assignedStaff: 'John Doe',
          confirmationId: 'RE-12345'
        });
        
        const completeReq = mockRequest(mockAdminUser, { wasteAmount: 25 }, { id: mockPickupId });
        const completeRes = mockResponse();
        
        await WasteCollectionController.completePickup(completeReq, completeRes);
        
        expect.toHaveBeenCalledWith(completeRes.status, 200);
        
        // Optional alternative flow: User cancels pickup
        // Update mock to return a "Scheduled" pickup
        WasteCollectionService.getPickupById = async () => ({ 
          _id: mockPickupId, 
          userId: mockUserId,
          address: '123 Test St',
          province: 'Western',
          wasteType: 'Recyclables',
          scheduledDate: new Date('2025-12-01'),
          scheduledTime: '10:00',
          status: 'Scheduled',
          confirmationId: 'RE-12345'
        });
        
        const cancelReq = mockRequest(mockUser, {}, { id: mockPickupId });
        const cancelRes = mockResponse();
        
        await WasteCollectionController.cancelPickup(cancelReq, cancelRes);
        
        expect.toHaveBeenCalledWith(cancelRes.status, 200);

        console.log("All test steps completed successfully!");
      } catch (error) {
        console.error("Test failed:", error.message);
        throw error;
      }
    });
  });
});