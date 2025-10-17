import WasteCollection from '../models/WasteCollection.js';
import BillService from '../services/billService.js';
import Bill from '../models/Bill.js';

// Create a function to handle post-save operations
const handleWasteCollectionUpdate = async (doc) => {
  try {
    // Check if the document was updated to Completed status
    if (doc && doc.status === 'Completed') {
      console.log(`WasteCollection ${doc._id} completed - checking for bill generation`);
      
      // Check if a bill already exists for this collection to prevent duplicates
      const existingBill = await Bill.findOne({ collectionId: doc._id });
      if (existingBill) {
        console.log(`Bill already exists for collection ${doc._id}, skipping creation`);
        return;
      }

      // Set default waste amount if not provided
      const wasteAmount = doc.wasteAmount || 5; // Default to 5kg if no amount provided
      
      console.log(`Generating bill for ${wasteAmount}kg of ${doc.wasteType}`);
      
      // Generate a bill automatically based on weight
      const bill = await BillService.createBill(doc, 'system');
      
      console.log(`Bill generated for WasteCollection ${doc._id}: LKR ${bill.amount}, ID: ${bill._id}`);
    }
  } catch (error) {
    console.error('Error in waste collection hook:', error);
  }
};

// Add post hooks for findOneAndUpdate
WasteCollection.schema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await handleWasteCollectionUpdate(doc);
  } else {
    console.log('Warning: No document returned from findOneAndUpdate');
  }
});

// Add post hooks for findByIdAndUpdate
WasteCollection.schema.post('findByIdAndUpdate', async function(doc) {
  if (doc) {
    await handleWasteCollectionUpdate(doc);
  }
});

// Also handle direct saves
WasteCollection.schema.post('save', async function() {
  if (this.status === 'Completed') {
    const doc = this;
    await handleWasteCollectionUpdate(doc);
  }
});

console.log('Waste Collection hooks initialized!');