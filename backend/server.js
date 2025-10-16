import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import walletRoutes from './routes/walletRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import wasteCollectionRoutes from "./routes/wasteCollectionRoutes.js"; // Import waste collection routes
import rewardRoutes from "./routes/rewardRoutes.js"; // Import reward routes
import billRoutes from './routes/billRoutes.js'; // Add this line
import transactionRoutes from './routes/transactionRoutes.js'; // Add this line

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

// IMPORTANT: Register the auth middleware BEFORE applying outstandingBillsMiddleware
app.use('/api/waste-collection', authMiddleware);
app.use('/api/waste-collection', outstandingBillsMiddleware);

// Then register your route handlers
app.use('/api/waste-collection', wasteCollectionRoutes); // Add waste collection routes
app.use("/api/auth", authRoutes);
app.use('/api/wallet', walletRoutes);
app.use("/api/rewards", rewardRoutes); // Add reward routes
app.use('/api/bills', billRoutes); // Add this line
app.use('/api/transactions', transactionRoutes); // Add this line

// Import hooks to activate them
import './hooks/wasteCollectionHooks.js';

// Example test route (for CRUD later)
app.get("/api/test", (req, res) => {
  res.json({ message: "API route working fine ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
