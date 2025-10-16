import Bill from '../models/Bill.js';
import WasteCollection from '../models/WasteCollection.js';
import mongoose from 'mongoose';

class BillService {
  // Create a new bill for a waste collection
  static async createBill(collectionData, createdBy) {
    try {
      // Calculate the bill amount based on waste type and weight
      const amount = await this.calculateBillAmount(collectionData);
      
      // Set due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Determine tags based on waste collection data
      const tags = [collectionData.wasteType];
      if (collectionData.wasteAmount > 20) {
        tags.push('Bulk');
      }
      
      // Create the bill
      const bill = new Bill({
        userId: collectionData.userId,
        collectionId: collectionData._id,
        title: `${collectionData.wasteType} Collection (${collectionData.wasteAmount || 0}kg)`,
        amount,
        dueDate,
        status: 'due',
        tags,
        notes: `Scheduled on ${new Date(collectionData.scheduledDate).toLocaleDateString()}`,
        createdBy
      });
      
      return await bill.save();
    } catch (error) {
      throw new Error(`Failed to create bill: ${error.message}`);
    }
  }

  // Calculate bill amount based on waste collection details
  static async calculateBillAmount(collectionData) {
    // Base rates per waste type (LKR per kg)
    const baseRates = {
      'Recyclables': 5,
      'General Waste': 10,
      'Compost': 7,
      'Hazardous': 15
    };
    
    // Get base rate for this waste type
    const baseRate = baseRates[collectionData.wasteType] || 10;
    
    // Calculate based on waste amount, with minimum fee
    const wasteAmount = collectionData.wasteAmount || 1;
    let amount = Math.max(baseRate * wasteAmount, 100);
    
    // Round to nearest whole number
    return Math.round(amount);
  }

  // Get all bills for a user with filtering options
  static async getUserBills(userId, filters = {}) {
    try {
      const query = { userId };
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      // Check for overdue bills and update their status
      const dueBills = await Bill.find({ 
        userId, 
        status: 'due', 
        dueDate: { $lt: new Date() } 
      });
      
      for (const bill of dueBills) {
        bill.status = 'overdue';
        await bill.save();
      }
      
      // Get bills with sorting
      return await Bill.find(query)
        .sort({ dueDate: 1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get user bills: ${error.message}`);
    }
  }

  // Get all bills (admin function)
  static async getAllBills(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.userId) {
        query.userId = filters.userId;
      }
      
      // Update any overdue bills
      await Bill.updateMany(
        { status: 'due', dueDate: { $lt: new Date() } },
        { $set: { status: 'overdue' } }
      );
      
      const total = await Bill.countDocuments(query);
      const bills = await Bill.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      
      return {
        bills,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Failed to get bills: ${error.message}`);
    }
  }

  // Get bill by ID
  static async getBillById(billId) {
    try {
      const bill = await Bill.findById(billId);
      if (!bill) {
        throw new Error('Bill not found');
      }
      
      // Check if bill is overdue
      bill.checkIfOverdue();
      if (bill.isModified()) {
        await bill.save();
      }
      
      return bill;
    } catch (error) {
      throw new Error(`Failed to get bill: ${error.message}`);
    }
  }

  // Mark a bill as paid
  static async markBillAsPaid(billId, paymentDetails) {
    try {
      const bill = await this.getBillById(billId);
      
      bill.status = 'paid';
      bill.paymentDate = new Date();
      bill.paymentMethod = paymentDetails.method;
      bill.paymentReference = paymentDetails.reference;
      
      return await bill.save();
    } catch (error) {
      throw new Error(`Failed to mark bill as paid: ${error.message}`);
    }
  }

  // Check if user has outstanding bills
  static async hasOutstandingBills(userId) {
    try {
      // Update any bills that are overdue but still marked as 'due'
      await Bill.updateMany(
        { userId, status: 'due', dueDate: { $lt: new Date() } },
        { $set: { status: 'overdue' } }
      );
      
      // Count only overdue bills, not all unpaid bills
      const count = await Bill.countDocuments({
        userId,
        status: 'overdue'
      });
      
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check outstanding bills: ${error.message}`);
    }
  }

  // Get total outstanding balance for a user
  static async getOutstandingBalance(userId) {
    try {
      const result = await Bill.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'overdue' // Only overdue bills count as "outstanding"
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Failed to get outstanding balance: ${error.message}`);
    }
  }
}

export default BillService;