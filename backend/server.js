import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import wasteCollectionRoutes from "./routes/wasteCollectionRoutes.js"; // Import waste collection routes
import containerRoutes from "./routes/containerRoutes.js";
import { simulateSensorData, startAutomatedSimulation } from "./utils/sensorSimulator.js";

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste-collection", wasteCollectionRoutes); // Add waste collection routes
app.use("/api/containers", containerRoutes);

// Example test route (for CRUD later)
app.get("/api/test", (req, res) => {
  res.json({ message: "API route working fine ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  
  // Start automated sensor simulation after server starts
  setTimeout(() => {
    startAutomatedSimulation();
  }, 3000); // Wait 3 seconds for DB connection to stabilize
});
