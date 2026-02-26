const API_URL = "http://localhost:3070";

export interface Stock {
  symbol: string;
  currentPrice: number;
  lastUpdated: string | null;
  shares: number;
  avgBuyPrice: number;
  lastBuyPrice: number;
  profit: number;
}

export interface CashBalance {
  cash: number;
}

export interface Transaction {
  _id: string;
  symbol: string;
  type: "BUY" | "SELL";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface Config {
  tickers: string[];
}

export async function getConfig(): Promise<Config> {
  const response = await fetch(`${API_URL}/api/config`);
  if (!response.ok) {
    throw new Error("Failed to fetch config");
  }
  return response.json();
}

export async function getStocks(): Promise<{ stocks: Stock[] }> {
  const response = await fetch(`${API_URL}/api/stocks`);
  if (!response.ok) {
    throw new Error("Failed to fetch stocks");
  }
  return response.json();
}

export async function buyStock(symbol: string, shares: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/stocks/${symbol}/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shares }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to buy stock");
  }
}

export async function sellStock(symbol: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/stocks/${symbol}/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sell stock");
  }
}

export async function getCashBalance(): Promise<CashBalance> {
  const response = await fetch(`${API_URL}/api/cash`);
  if (!response.ok) {
    throw new Error("Failed to fetch cash balance");
  }
  return response.json();
}

export async function getTransactions(): Promise<{ transactions: Transaction[] }> {
  const response = await fetch(`${API_URL}/api/transactions`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}
