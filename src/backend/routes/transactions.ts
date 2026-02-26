import { Router, Request, Response } from "express";
import Transaction from "../models/Transaction";

const router = Router();

// Get transaction history
router.get("/", async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;
