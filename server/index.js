// server/index.js

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Bypasses ISP DNS blocking for MongoDB Atlas

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json()); // Allows server to read incoming JSON data

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "TalentFlow AI Backend Engine is up and running!",
    timestamp: new Date().toISOString(),
  });
});

// Start Server after Database Connection
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
});
