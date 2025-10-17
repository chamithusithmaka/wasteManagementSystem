import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  // Use a test database (different from your main database)
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('✅ Test database connected');
  }
});

afterAll(async () => {
  // Clean up and close connection after all tests
  await mongoose.connection.close();
  console.log('✅ Test database disconnected');
});