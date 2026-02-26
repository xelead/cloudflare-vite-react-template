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

async function extractErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const error = await response.json();
      if (error?.error && typeof error.error === "string") {
        return error.error;
      }
    } catch {
      // Ignore parse failures and fall back to text/status.
    }
  }

  try {
    const text = (await response.text()).trim();
    if (text) {
      return text;
    }
  } catch {
    // Ignore read failures and use fallback.
  }

  return `${fallbackMessage} (${response.status})`;
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
    const message = await extractErrorMessage(response, "Failed to buy stock");
    throw new Error(message);
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
    const message = await extractErrorMessage(response, "Failed to sell stock");
    throw new Error(message);
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
