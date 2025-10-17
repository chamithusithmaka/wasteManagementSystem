import mongoose from 'mongoose';
import Reward from '../models/Reward.js';

describe('Reward Model', () => {
  afterEach(async () => {
    await Reward.deleteMany({});
  });

  it('should create a reward with default values', async () => {
    const reward = await Reward.create({
      residentId: 'user123',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'Recyclables',
      label: 'Recyclables Reward',
      amount: 25,
      createdBy: 'system'
    });
    
    expect(reward.unit).toBe('LKR');
    expect(reward.used).toBe(false);
    expect(reward.usedAmount).toBe(0);
  });

  it('should create a recyclables reward', async () => {
    const reward = await Reward.create({
      residentId: 'eco-user',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'Recyclables',
      label: 'Recyclables (10kg)',
      amount: 10,
      unit: 'LKR',
      description: 'Reward for recyclables',
      createdBy: 'admin'
    });
    
    expect(reward.type).toBe('Recyclables');
    expect(reward.amount).toBe(10);
  });

  it('should mark reward as used', async () => {
    const reward = await Reward.create({
      residentId: 'user456',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'Compost',
      label: 'Compost (5kg)',
      amount: 5,
      createdBy: 'admin'
    });
    
    reward.used = true;
    reward.usedAmount = 5;
    reward.usedDate = new Date();
    await reward.save();
    
    expect(reward.used).toBe(true);
    expect(reward.usedAmount).toBe(5);
  });

  it('should create different reward types', async () => {
    const recyclables = await Reward.create({
      residentId: 'user789',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'Recyclables',
      label: 'Recyclables',
      amount: 15,
      createdBy: 'system'
    });
    
    const compost = await Reward.create({
      residentId: 'user789',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'Compost',
      label: 'Compost',
      amount: 5,
      createdBy: 'system'
    });
    
    expect(recyclables.type).toBe('Recyclables');
    expect(compost.type).toBe('Compost');
  });

  it('should store reward description', async () => {
    const reward = await Reward.create({
      residentId: 'desc-user',
      collectionId: new mongoose.Types.ObjectId(),
      type: 'E-Waste',
      label: 'E-Waste (3kg)',
      amount: 6,
      description: 'Reward for electronic waste',
      createdBy: 'admin'
    });
    
    expect(reward.description).toBe('Reward for electronic waste');
  });
});