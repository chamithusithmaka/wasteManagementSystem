import WasteCollection from '../models/WasteCollection.js';
import Reward from '../models/Reward.js';
import WasteCollectionService from '../services/wasteCollectionService.js';

// Create a new reward
export const createReward = async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json(reward);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all rewards (optionally filter by residentId or collectionId)
export const getRewards = async (req, res) => {
  try {
    const { residentId, collectionId } = req.query;
    const filter = {};
    
    // If residentId is specified in query, use it
    // Otherwise use the authenticated user's ID
    if (residentId) {
      filter.residentId = residentId;
    } else {
      // Use authenticated user from middleware (default to their own rewards)
      filter.residentId = req.user._id.toString();
    }
    
    if (collectionId) filter.collectionId = collectionId;
    
    const rewards = await Reward.find(filter).sort({ date: -1 });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single reward by ID
export const getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a reward
export const updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.json(reward);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a reward
export const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.json({ message: 'Reward deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Calculate and create a reward based on waste type and amount
 * This function is called from wasteCollectionController when a pickup is completed
 */
export const calculateAndCreateReward = async (pickup, wasteAmount, createdBy = 'admin') => {
  try {
    console.log('Calculating reward for pickup:', pickup._id);
    console.log('Waste type:', pickup.wasteType);
    console.log('Waste amount:', wasteAmount);
    
    // Calculate reward amount based on waste type and quantity
    let rewardAmount = 0;
    let rewardType = pickup.wasteType;
    let rewardLabel = '';
    
    switch(pickup.wasteType) {
      case 'Recyclables':
        rewardAmount = wasteAmount * 1.0; // 1 LKR per kg
        rewardLabel = `Recyclables (${wasteAmount}kg)`;
        break;
      case 'Compost':
        rewardAmount = wasteAmount * 0.5; // 0.5 LKR per kg
        rewardLabel = `Compost (${wasteAmount}kg)`;
        break;
      case 'Hazardous':
        // No reward for hazardous waste
        rewardAmount = 0;
        rewardLabel = `Hazardous (${wasteAmount}kg)`;
        break;
      case 'E-Waste':
        rewardAmount = wasteAmount * 2.0; // 2 LKR per kg - highest reward
        rewardLabel = `E-Waste (${wasteAmount}kg)`;
        break;
      default:
        rewardAmount = wasteAmount * 0.25; // Default reward
        rewardLabel = `${pickup.wasteType} (${wasteAmount}kg)`;
    }
    
    // Round to 2 decimal places
    rewardAmount = Math.round(rewardAmount * 100) / 100;
    
    // Only create reward if amount > 0
    if (rewardAmount > 0) {
      console.log('Creating reward of', rewardAmount, 'LKR');
      
      const reward = new Reward({
        residentId: pickup.userId.toString(),
        collectionId: pickup._id,
        type: rewardType,
        label: rewardLabel,
        amount: rewardAmount,
        unit: 'LKR',
        date: new Date(),
        description: `Reward for ${rewardLabel}`,
        createdBy: createdBy || 'system'
      });
      
      await reward.save();
      console.log('Reward created with ID:', reward._id);
      return reward;
    }
    
    console.log('No reward created (amount is 0)');
    return null;
  } catch (err) {
    console.error('Error calculating reward:', err);
    return null;
  }
};