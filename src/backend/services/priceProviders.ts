import StockPrice from "../models/StockPrice";
import { ibkrService } from "./ibkr";

// Custom error for price provider failures
export class PriceProviderError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] ${message}`);
    this.name = "PriceProviderError";
  }
}

// Price Provider Interface
export interface PriceProvider {
  name: string;
  fetchPrice(symbol: string): Promise<number | null>;
}

// Alpha Vantage Provider
class AlphaVantageProvider implements PriceProvider {
  name = "AlphaVantage";
  private apiKey: string;
  private dailyRequestCount = 0;
  private lastResetDate: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.lastResetDate = new Date().toDateString();
  }

  async fetchPrice(symbol: string): Promise<number | null> {
    // Reset counter if it's a new day
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
    }

    // Check if we've hit the daily limit (25 requests/day for free tier)
    if (this.dailyRequestCount >= 25) {
      throw new PriceProviderError(this.name, "Daily limit reached (25 requests)");
    }

    if (!this.apiKey) {
      throw new PriceProviderError(this.name, "No API key configured");
    }

    try {
      console.log(`[${this.name}] Fetching ${symbol}...`);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );
      const data = await response.json();

      this.dailyRequestCount++;

      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        const price = parseFloat(data["Global Quote"]["05. price"]);
        console.log(`[${this.name}] ${symbol}: $${price}`);
        return price;
      }

      // Check for rate limit or other errors
      if (data.Note || data.Information) {
        throw new PriceProviderError(this.name, `API limit: ${data.Note || data.Information}`);
      }

      throw new PriceProviderError(this.name, `No price data for ${symbol}`);
    } catch (error) {
      if (error instanceof PriceProviderError) {
        throw error;
      }
      throw new PriceProviderError(this.name, `Error fetching ${symbol}: ${error}`);
    }
  }
}

// Finnhub Provider
class FinnhubProvider implements PriceProvider {
  name = "Finnhub";
  private apiKey: string;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol: string): Promise<number | null> {
    if (!this.apiKey) {
      throw new PriceProviderError(this.name, "No API key configured. Get a free API key at https://finnhub.io/register");
    }

    // Rate limiting: max 60 calls/minute for free tier
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 1000) {
      // Wait at least 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastRequest));
    }

    try {
      console.log(`[${this.name}] Fetching ${symbol}...`);
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`
      );
      const data = await response.json();

      this.lastRequestTime = Date.now();
      this.requestCount++;

      // Reset counter every minute
      setTimeout(() => {
        this.requestCount = Math.max(0, this.requestCount - 1);
      }, 60000);

      if (data.c) { // 'c' is current price in Finnhub
        const price = parseFloat(data.c);
        console.log(`[${this.name}] ${symbol}: $${price}`);
        return price;
      }

      if (data.error) {
        throw new PriceProviderError(this.name, `API error: ${data.error}`);
      }

      throw new PriceProviderError(this.name, `No price data for ${symbol}`);
    } catch (error) {
      if (error instanceof PriceProviderError) {
        throw error;
      }
      throw new PriceProviderError(this.name, `Error fetching ${symbol}: ${error}`);
    }
  }
}

// IBKR Provider
class IBKRProvider implements PriceProvider {
  name = "IBKR";

  async fetchPrice(symbol: string): Promise<number | null> {
    if (!ibkrService.isConnected()) {
      throw new PriceProviderError(this.name, "Not connected to IBKR TWS/Gateway");
    }

    try {
      console.log(`[${this.name}] Fetching ${symbol}...`);
      const price = await ibkrService.getPrice(symbol);

      if (price === null || price <= 0) {
        throw new PriceProviderError(this.name, `No price received for ${symbol}`);
      }

      console.log(`[${this.name}] ${symbol}: $${price}`);
      await this.savePrice(symbol, price);
      return price;
    } catch (error) {
      if (error instanceof PriceProviderError) {
        throw error;
      }
      throw new PriceProviderError(this.name, `Error fetching ${symbol}: ${error}`);
    }
  }

  private async savePrice(symbol: string, price: number): Promise<void> {
    try {
      await StockPrice.findOneAndUpdate(
        { symbol },
        { symbol, price, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`[${this.name}] Error saving price for ${symbol}:`, error);
    }
  }
}

// Mock Provider (only used when explicitly configured as simulator)
class MockProvider implements PriceProvider {
  name = "Simulator";
  private basePrices: { [key: string]: number } = {
    AAPL: 175.5,
    MSFT: 380.2,
    GOOGL: 142.8,
    AMZN: 178.9,
    TSLA: 245.3,
    NVDA: 485.6,
    META: 495.2,
    NFLX: 485.7,
  };

  async fetchPrice(symbol: string): Promise<number | null> {
    const basePrice = this.basePrices[symbol] || 100.0;
    // Add random variation (±5%) to make prices visibly change
    const variation = (Math.random() - 0.5) * 0.10;
    const newPrice = parseFloat((basePrice * (1 + variation)).toFixed(2));
    console.log(`[${this.name}] ${symbol}: $${newPrice} (base: $${basePrice}, variation: ${(variation * 100).toFixed(1)}%) - SIMULATION MODE`);
    return newPrice;
  }
}

// Provider Manager
export class PriceProviderManager {
  private provider: PriceProvider | null = null;
  private useSimulator: boolean = false;

  constructor() {
    // Initialize providers from environment variables
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || "";
    const finnhubKey = process.env.FINNHUB_API_KEY || "";
    const primaryProvider = process.env.PRICE_PROVIDER || "ibkr";

    if (primaryProvider === "simulator") {
      this.useSimulator = true;
      this.provider = new MockProvider();
      console.log(`[PriceProviderManager] Using SIMULATOR mode (fake prices)`);
    } else if (primaryProvider === "ibkr") {
      this.provider = new IBKRProvider();
      console.log(`[PriceProviderManager] Using IBKR provider`);
    } else if (primaryProvider === "finnhub") {
      if (!finnhubKey) {
        console.error(`[PriceProviderManager] ERROR: PRICE_PROVIDER is set to 'finnhub' but FINNHUB_API_KEY is not configured!`);
        console.error(`[PriceProviderManager] Please set FINNHUB_API_KEY in your .env file or use PRICE_PROVIDER=simulator for testing`);
        console.error(`[PriceProviderManager] Get a free API key at: https://finnhub.io/register`);
        throw new PriceProviderError("PriceProviderManager", "Finnhub API key is required. Set FINNHUB_API_KEY or use PRICE_PROVIDER=simulator");
      }
      this.provider = new FinnhubProvider(finnhubKey);
      console.log(`[PriceProviderManager] Using Finnhub provider`);
    } else if (primaryProvider === "alphavantage") {
      if (!alphaVantageKey) {
        console.error(`[PriceProviderManager] ERROR: PRICE_PROVIDER is set to 'alphavantage' but ALPHA_VANTAGE_API_KEY is not configured!`);
        console.error(`[PriceProviderManager] Please set ALPHA_VANTAGE_API_KEY in your .env file or use PRICE_PROVIDER=simulator for testing`);
        throw new PriceProviderError("PriceProviderManager", "Alpha Vantage API key is required. Set ALPHA_VANTAGE_API_KEY or use PRICE_PROVIDER=simulator");
      }
      this.provider = new AlphaVantageProvider(alphaVantageKey);
      console.log(`[PriceProviderManager] Using Alpha Vantage provider`);
    } else {
      throw new PriceProviderError("PriceProviderManager", `Unknown provider: ${primaryProvider}. Use 'ibkr', 'finnhub', 'alphavantage', or 'simulator'`);
    }
  }

  async fetchPrice(symbol: string): Promise<number | null> {
    if (!this.provider) {
      throw new PriceProviderError("PriceProviderManager", "No provider configured");
    }

    const price = await this.provider.fetchPrice(symbol);

    if (price === null || price <= 0) {
      throw new PriceProviderError(this.provider.name, `Failed to get valid price for ${symbol}`);
    }

    await this.savePrice(symbol, price);
    return price;
  }

  private async savePrice(symbol: string, price: number): Promise<void> {
    try {
      await StockPrice.findOneAndUpdate(
        { symbol },
        { symbol, price, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`[PriceProviderManager] Error saving price for ${symbol}:`, error);
    }
  }

  getProviderName(): string {
    return this.provider?.name || "None";
  }

  isSimulator(): boolean {
    return this.useSimulator;
  }
}

// Export singleton
export const priceProviderManager = new PriceProviderManager();
