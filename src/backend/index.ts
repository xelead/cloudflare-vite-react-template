import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./db";
import stocksRouter from "./routes/stocks";
import cashRouter from "./routes/cash";
import transactionsRouter from "./routes/transactions";
import { priceService } from "./services";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api", stocksRouter);
app.use("/api/cash", cashRouter);
app.use("/api/transactions", transactionsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start price polling
priceService.startPolling(30);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/config           - Get ticker configuration`);
  console.log(`  GET  /api/stocks           - Get all stocks with prices`);
  console.log(`  POST /api/stocks/:symbol/buy  - Buy shares`);
  console.log(`  POST /api/stocks/:symbol/sell - Sell all shares`);
  console.log(`  GET  /api/cash             - Get cash balance`);
  console.log(`  GET  /api/transactions     - Get transaction history`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  priceService.stopPolling();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  priceService.stopPolling();
  process.exit(0);
});
