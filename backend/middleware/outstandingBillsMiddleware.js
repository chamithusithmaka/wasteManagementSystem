import BillService from '../services/billService.js';
import Bill from '../models/Bill.js'; // Add this import

const outstandingBillsMiddleware = async (req, res, next) => {
  try {
    // Skip middleware for non-scheduling routes
    if (req.path !== '/schedule') {
      return next();
    }
    
    // Check if req.user exists
    if (!req.user) {
      console.log('Warning: req.user is undefined in outstandingBillsMiddleware');
      return next();
    }
    
    const userId = req.user._id;
    if (!userId) {
      console.log('Warning: req.user._id is missing in outstandingBillsMiddleware');
      return next();
    }
    
    // Check specifically for OVERDUE bills, not just any bills
    const overdueCount = await Bill.countDocuments({
      userId,
      status: 'overdue'
    });

    // If there are overdue bills, block scheduling
    if (overdueCount > 0) {
      const overdueTotal = await Bill.aggregate([
        { $match: { userId, status: 'overdue' }},
        { $group: { _id: null, total: { $sum: '$amount' }}}
      ]);
      
      const outstandingBalance = overdueTotal.length > 0 ? overdueTotal[0].total : 0;
      
      return res.status(403).json({
        message: 'You have overdue bills that must be paid before scheduling new pickups',
        outstandingBalance,
        code: 'OVERDUE_BILLS'
      });
    }
    
    // Allow scheduling if no overdue bills (even if there are due bills)
    next();
  } catch (error) {
    console.error('Error in outstandingBillsMiddleware:', error);
    next(error);
  }
};

export default outstandingBillsMiddleware;