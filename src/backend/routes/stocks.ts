import { Router, Request, Response } from "express";
import Position from "../models/Position";
import Transaction from "../models/Transaction";
import StockPrice from "../models/StockPrice";
import CashBalance from "../models/CashBalance";
import { ibkrService, priceService } from "../services";
import tickers from "../config/tickers.json";

const router = Router();

// Get ticker configuration
router.get("/config", (req: Request, res: Response) => {
  res.json({ tickers: tickers.tickers });
});

// Get all stocks with prices and positions
router.get("/stocks", async (req: Request, res: Response) => {
  try {
    const prices = await priceService.getLatestPrices();
    const positions = await Position.find().lean();

    const stocks = tickers.tickers.map((symbol) => {
      const priceData = prices.find((p) => p.symbol === symbol);
      const position = positions.find((p) => p.symbol === symbol);

      return {
        symbol,
        currentPrice: priceData?.price || 0,
        lastUpdated: priceData?.lastUpdated || null,
        shares: position?.shares || 0,
        avgBuyPrice: position?.avgBuyPrice || 0,
        lastBuyPrice: position?.lastBuyPrice || 0,
        profit: position?.shares ? ((priceData?.price || 0) - position.avgBuyPrice) * position.shares : 0,
      };
    });

    res.json({ stocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// Buy stock
router.post("/stocks/:symbol/buy", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { shares } = req.body;

    if (!shares || shares <= 0) {
      res.status(400).json({ error: "Invalid shares amount" });
      return;
    }

    // Check IBKR connection first
    if (!ibkrService.isConnected()) {
      res.status(503).json({ error: "Not connected to IBKR. Please ensure TWS/IB Gateway is running." });
      return;
    }

    // Get current price
    const priceData = await StockPrice.findOne({ symbol });
    const currentPrice = priceData?.price || 0;

    if (currentPrice <= 0) {
      res.status(400).json({ error: "Price not available" });
      return;
    }

    const total = currentPrice * shares;

    // Get cash balance
    let cashBalance = await CashBalance.findOne();

    if (!cashBalance) {
      cashBalance = await CashBalance.create({ amount: 100000 });
    }

    // Check if enough cash
    if (cashBalance.amount < total) {
      res.status(400).json({ error: "Insufficient funds" });
      return;
    }

    // Place order with IBKR and wait for confirmation
    const orderSuccess = await ibkrService.placeLimitOrder(symbol, "BUY", shares, currentPrice);

    if (!orderSuccess) {
      res.status(502).json({ error: "Order rejected by IBKR. Check TWS/IB Gateway for details." });
      return;
    }

    // Only update local state after IBKR confirms the order
    cashBalance.amount -= total;
    await cashBalance.save();

    // Update or create position
    let position = await Position.findOne({ symbol });
    if (position) {
      // Calculate new average price
      const totalShares = position.shares + shares;
      const totalCost = position.avgBuyPrice * position.shares + currentPrice * shares;
      position.avgBuyPrice = totalCost / totalShares;
      position.shares = totalShares;
      position.lastBuyPrice = currentPrice;
      await position.save();
    } else {
      position = await Position.create({
        symbol,
        shares,
        avgBuyPrice: currentPrice,
        lastBuyPrice: currentPrice,
      });
    }

    // Create transaction
    await Transaction.create({
      symbol,
      type: "BUY",
      shares,
      price: currentPrice,
      total,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      orderPlaced: true,
      orderConfirmedByIBKR: true,
      symbol,
      shares,
      price: currentPrice,
      total,
      remainingCash: cashBalance.amount,
    });
  } catch (error) {
    console.error("Error buying stock:", error);
    res.status(500).json({ error: "Failed to buy stock" });
  }
});

// Sell all shares
router.post("/stocks/:symbol/sell", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    // Check IBKR connection first
    if (!ibkrService.isConnected()) {
      res.status(503).json({ error: "Not connected to IBKR. Please ensure TWS/IB Gateway is running." });
      return;
    }

    // Get position
    const position = await Position.findOne({ symbol });

    if (!position || position.shares <= 0) {
      res.status(400).json({ error: "No shares to sell" });
      return;
    }

    // Get current price
    const priceData = await StockPrice.findOne({ symbol });
    const currentPrice = priceData?.price || 0;

    if (currentPrice <= 0) {
      res.status(400).json({ error: "Price not available" });
      return;
    }

    const shares = position.shares;
    const total = currentPrice * shares;

    // Place order with IBKR and wait for confirmation
    const orderSuccess = await ibkrService.placeLimitOrder(symbol, "SELL", shares, currentPrice);

    if (!orderSuccess) {
      res.status(502).json({ error: "Order rejected by IBKR. Check TWS/IB Gateway for details." });
      return;
    }

    // Only update local state after IBKR confirms the order
    let cashBalance = await CashBalance.findOne();

    if (!cashBalance) {
      cashBalance = await CashBalance.create({ amount: 100000 });
    }

    cashBalance.amount += total;
    await cashBalance.save();

    // Remove position
    await Position.deleteOne({ symbol });

    // Create transaction
    await Transaction.create({
      symbol,
      type: "SELL",
      shares,
      price: currentPrice,
      total,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      orderPlaced: true,
      orderConfirmedByIBKR: true,
      symbol,
      shares,
      price: currentPrice,
      total,
      totalCash: cashBalance.amount,
    });
  } catch (error) {
    console.error("Error selling stock:", error);
    res.status(500).json({ error: "Failed to sell stock" });
  }
});

export default router;
