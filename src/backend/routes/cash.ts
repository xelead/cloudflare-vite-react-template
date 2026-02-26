import { Router, Request, Response } from "express";
import CashBalance from "../models/CashBalance";

const router = Router();

// Get cash balance
router.get("/", async (req: Request, res: Response) => {
  try {
    let cashBalance = await CashBalance.findOne();

    if (!cashBalance) {
      const initialCash = parseInt(process.env.INITIAL_CASH || "100000");
      cashBalance = await CashBalance.create({ amount: initialCash });
    }

    res.json({ cash: cashBalance.amount });
  } catch (error) {
    console.error("Error fetching cash balance:", error);
    res.status(500).json({ error: "Failed to fetch cash balance" });
  }
});

export default router;
