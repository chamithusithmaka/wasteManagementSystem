import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import walletRoutes from './routes/walletRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import wasteCollectionRoutes from "./routes/wasteCollectionRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import billRoutes from './routes/billRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import containerRoutes from "./routes/containerRoutes.js";
import { simulateSensorData } from "./utils/sensorSimulator.js";

dotenv.config(); // Load .env variables

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Simple route
app.get("/", (req, res) => {
  res.send("🚀 Express backend is running successfully!");
});

// First set up your auth middleware
import authMiddleware from './middleware/authMiddleware.js';
import outstandingBillsMiddleware from './middleware/outstandingBillsMiddleware.js';

// Register routes BEFORE applying middleware to waste-collection
app.use("/api/auth", authRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use("/api/rewards", authMiddleware, rewardRoutes);
app.use('/api/bills', authMiddleware, billRoutes); // <-- Make sure this is here
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use("/api/containers", containerRoutes);

// Then apply middleware and routes for waste-collection
app.use('/api/waste-collection', authMiddleware);
app.use('/api/waste-collection', outstandingBillsMiddleware);
app.use('/api/waste-collection', wasteCollectionRoutes);

// Import hooks to activate them
import './hooks/wasteCollectionHooks.js';

// Example test route (for CRUD later)
app.get("/api/test", (req, res) => {
  res.json({ message: "API route working fine ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
