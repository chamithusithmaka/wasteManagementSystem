import Reward from '../models/Reward.js';

const REWARD_RATES = {
  'Recyclables': 1.0,
  'Compost': 0.5,
  'Hazardous': 0,
  'E-Waste': 2.0,
  'default': 0.25
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

/**
 * Calculate and create a reward based on waste type and amount
 * This function is called from wasteCollectionController when a pickup is completed
 */

//Uses a REWARD_RATES map to avoid magic numbers and switch-case duplication.
export const calculateAndCreateReward = async (pickup, wasteAmount, createdBy = 'admin') => {
  try {
    if (!pickup || typeof wasteAmount !== 'number') {
      console.error('Invalid pickup or wasteAmount');
      return null;
    }

    const wasteType = pickup.wasteType || 'default';
    const rate = REWARD_RATES.hasOwnProperty(wasteType) ? REWARD_RATES[wasteType] : REWARD_RATES['default'];
    const rewardAmount = Math.round(wasteAmount * rate * 100) / 100;

    if (rewardAmount <= 0) {
      console.log('No reward created (amount is 0)');
      return null;
    }

    const rewardLabel = `${wasteType} (${wasteAmount}kg)`;
    const reward = new Reward({
      residentId: pickup.userId?.toString(),
      collectionId: pickup._id,
      type: wasteType,
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
  } catch (err) {
    console.error('Error calculating reward:', err);
    return null;
  }
};