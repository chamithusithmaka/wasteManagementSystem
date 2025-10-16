import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import walletRoutes from './routes/walletRoutes.js';

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

// Example test route (for CRUD later)
app.get("/api/test", (req, res) => {
  res.json({ message: "API route working fine ✅" });
});

// Wallet routes
app.use('/api/wallet', walletRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
