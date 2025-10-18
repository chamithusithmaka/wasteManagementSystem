import WasteCollectionService from '../services/wasteCollectionService.js';
import { validateWastePickup } from '../utils/validation.js';
import { calculateAndCreateReward } from './rewardController.js';
import BillService from '../services/billService.js';
import Bill from '../models/Bill.js';

class WasteCollectionController {
  // Create new pickup request
  static async schedulePickup(req, res) {
    try {
      const { address, province, wasteType, scheduledDate, scheduledTime, notes, containerFillLevel } = req.body;
      const userId = req.user._id;
      const username = req.user.username;

      // const validationError = validateWastePickup({ address, wasteType, scheduledDate, scheduledTime });
      // if (validationError) {
      //   return res.status(400).json({ message: validationError });
      // }

      const pickupData = {
        userId,
        address,
        province,
        wasteType,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        notes,
        containerFillLevel,
        status: 'Scheduled',
        createdBy: username
      };

      const pickup = await WasteCollectionService.createPickup(pickupData);
      return res.status(201).json({
        message: 'Pickup scheduled successfully',
        pickup
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to schedule pickup',
        error: err.message
      });
    }
  }

  // Get user's pickups
  static async getUserPickups(req, res) {
    try {
      const userId = req.user._id;
      const { status } = req.query;
      
      const filter = {};
      if (status) {
        filter.status = status;
      }
      
      const pickups = await WasteCollectionService.getUserPickups(userId, filter);
      return res.status(200).json({ pickups });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to retrieve pickups',
        error: err.message
      });
    }
  }

  // Get a specific pickup
  static async getPickup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const pickup = await WasteCollectionService.getPickupById(id);
      
      if (!pickup) {
        return res.status(404).json({ message: 'Pickup not found' });
      }
      
      // Check if user is authorized (own pickup or admin)
      if (pickup.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access this pickup' });
      }
      
      return res.status(200).json({ pickup });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to retrieve pickup',
        error: err.message
      });
    }
  }

  // Update a pickup (user can only update their own pickups and only if status is 'Scheduled')
  static async updatePickup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { address, province, wasteType, scheduledDate, scheduledTime, notes, containerFillLevel } = req.body;
      
      const pickup = await WasteCollectionService.getPickupById(id);
      
      if (!pickup) {
        return res.status(404).json({ message: 'Pickup not found' });
      }
      
      // Check if user is authorized
      if (pickup.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this pickup' });
      }
      
      // Check if pickup is still in scheduled state
      if (pickup.status !== 'Scheduled') {
        return res.status(400).json({ message: 'Cannot update a pickup that is not in Scheduled state' });
      }
      
      const updates = {
        ...(address && { address }),
        ...(province && { province }),
        ...(wasteType && { wasteType }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(scheduledTime && { scheduledTime }),
        ...(notes !== undefined && { notes }),
        ...(containerFillLevel !== undefined && { containerFillLevel })
      };
      
      const updatedPickup = await WasteCollectionService.updatePickup(id, updates);
      return res.status(200).json({
        message: 'Pickup updated successfully',
        pickup: updatedPickup
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to update pickup',
        error: err.message
      });
    }
  }

  // Cancel a pickup
  static async cancelPickup(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const pickup = await WasteCollectionService.getPickupById(id);
      
      if (!pickup) {
        return res.status(404).json({ message: 'Pickup not found' });
      }
      
      // Check if user is authorized
      if (pickup.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to cancel this pickup' });
      }
      
      // Check if pickup can be cancelled
      if (pickup.status === 'Completed' || pickup.status === 'Cancelled') {
        return res.status(400).json({ message: `Cannot cancel a pickup that is already ${pickup.status}` });
      }
      
      const cancelledPickup = await WasteCollectionService.cancelPickup(id);
      return res.status(200).json({
        message: 'Pickup cancelled successfully',
        pickup: cancelledPickup
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to cancel pickup',
        error: err.message
      });
    }
  }

  // Cancel a pickup with time restriction (user only)
  static async cancelPickupWithTimeRestriction(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      try {
        const cancelledPickup = await WasteCollectionService.cancelPickupWithTimeRestriction(id, userId);
        
        return res.status(200).json({
          message: 'Pickup cancelled successfully',
          pickup: cancelledPickup
        });
      } catch (err) {
        // Return specific error messages to the client
        return res.status(400).json({
          message: err.message
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to cancel pickup',
        error: err.message
      });
    }
  }

  // Get user stats
  static async getUserStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await WasteCollectionService.getUserStats(userId);
      return res.status(200).json({ stats });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to retrieve stats',
        error: err.message
      });
    }
  }

  // ADMIN METHODS
  
  // Get all pickups (admin only)
  static async getAllPickups(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      
      const filter = {};
      if (status) {
        filter.status = status;
      }
      
      const result = await WasteCollectionService.getAllPickups(filter, parseInt(page), parseInt(limit));
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to retrieve pickups',
        error: err.message
      });
    }
  }

  // Assign staff to pickup (admin only)
  static async assignStaff(req, res) {
    try {
      const { id } = req.params;
      const { staffName } = req.body;
      
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      
      if (!staffName) {
        return res.status(400).json({ message: 'Staff name is required' });
      }
      
      const pickup = await WasteCollectionService.getPickupById(id);
      
      if (!pickup) {
        return res.status(404).json({ message: 'Pickup not found' });
      }
      
      if (pickup.status === 'Cancelled' || pickup.status === 'Completed') {
        return res.status(400).json({ message: `Cannot assign staff to a pickup that is ${pickup.status}` });
      }
      
      const updatedPickup = await WasteCollectionService.assignStaff(id, staffName);
      return res.status(200).json({
        message: 'Staff assigned successfully',
        pickup: updatedPickup
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to assign staff',
        error: err.message
      });
    }
  }

  // Complete pickup (admin only)
  static async completePickup(req, res) {
    try {
      const { id } = req.params;
      const { wasteAmount } = req.body;

      console.log('--- Complete Pickup Called ---');
      console.log('Pickup ID:', id);
      console.log('Waste Amount:', wasteAmount);

      const pickup = await WasteCollectionService.getPickupById(id);
      console.log('Fetched Pickup:', pickup);

      if (!pickup) {
        console.log('Pickup not found');
        return res.status(404).json({ message: 'Pickup not found' });
      }

      if (pickup.status === 'Cancelled' || pickup.status === 'Completed') {
        console.log('Pickup already completed or cancelled:', pickup.status);
        return res.status(400).json({ message: `Pickup is already ${pickup.status}` });
      }

      // Complete the pickup (with waste amount)
      const completedPickup = await WasteCollectionService.completePickup(id, { wasteAmount });
      console.log('Completed Pickup:', completedPickup);

      // Create reward based on waste type and amount
      const reward = await calculateAndCreateReward(completedPickup, wasteAmount, req.user?.username || 'admin');
      console.log('Reward created:', reward ? reward._id : 'No reward (zero amount)');

      // Check if bill already exists
      const existingBill = await Bill.findOne({ collectionId: id });
      if (existingBill) {
        console.log('Bill already exists for this collection:', existingBill._id);
      } else {
        // Manually generate bill
        try {
          const bill = await BillService.createBill(completedPickup, req.user?.username || 'admin');
          console.log('Bill manually created:', bill._id, 'for amount:', bill.amount);
        } catch (billErr) {
          console.error('Failed to create bill:', billErr);
          // Continue even if bill creation fails
        }
      }

      return res.status(200).json({
        message: 'Pickup completed successfully and bill generated',
        pickup: completedPickup,
        reward: reward
      });
    } catch (err) {
      console.error('Error in completePickup:', err);
      return res.status(500).json({
        message: 'Failed to complete pickup',
        error: err.message
      });
    }
  }
}

export default WasteCollectionController;