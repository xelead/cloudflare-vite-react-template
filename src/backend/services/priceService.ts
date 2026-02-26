import StockPrice from "../models/StockPrice";
import { priceProviderManager, PriceProviderError } from "./priceProviders";
import tickers from "../config/tickers.json";

class PriceService {
  private isPolling: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private errorCount: number = 0;
  private readonly maxErrors: number = 5;

  public async fetchPrice(symbol: string): Promise<number | null> {
    // Use ONLY the configured price provider - NO FALLBACK
    try {
      const price = await priceProviderManager.fetchPrice(symbol);
      this.errorCount = 0; // Reset error count on success
      return price;
    } catch (error) {
      if (error instanceof PriceProviderError) {
        console.error(`[PriceService] Provider error for ${symbol}:`, error.message);
        throw error; // Re-throw so caller knows it's a provider issue
      }
      throw new PriceProviderError("PriceService", `Failed to fetch price for ${symbol}: ${error}`);
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
      console.error(`[PriceService] Error saving price for ${symbol}:`, error);
    }
  }

  public async fetchAllPrices(): Promise<void> {
    console.log("[PriceService] Fetching prices for all tickers...");
    console.log(`[PriceService] Provider: ${priceProviderManager.getProviderName()}${priceProviderManager.isSimulator() ? " (SIMULATION)" : ""}`);

    let successCount = 0;
    let errorCount = 0;

    for (const symbol of tickers.tickers) {
      try {
        await this.fetchPrice(symbol);
        successCount++;
      } catch (error) {
        errorCount++;
        if (error instanceof PriceProviderError) {
          console.error(`[PriceService] Error fetching ${symbol}:`, error.message);
        } else {
          console.error(`[PriceService] Error fetching ${symbol}:`, error);
        }
      }
      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`[PriceService] Price fetch completed: ${successCount} succeeded, ${errorCount} failed`);

    // If too many errors, stop polling
    if (errorCount >= this.maxErrors) {
      console.error(`[PriceService] Too many errors (${errorCount}). Stopping price polling.`);
      console.error(`[PriceService] Check your API configuration in .env file`);
      this.stopPolling();
    }
  }

  public startPolling(intervalSeconds: number = 30): void {
    if (this.isPolling) {
      console.log("[PriceService] Price polling already running");
      return;
    }

    // Check if provider is properly configured before starting
    try {
      const providerName = priceProviderManager.getProviderName();
      const isSimulator = priceProviderManager.isSimulator();

      console.log(`[PriceService] Starting price polling every ${intervalSeconds} seconds`);
      console.log(`[PriceService] Provider: ${providerName}${isSimulator ? " (SIMULATION MODE)" : ""}`);

      if (isSimulator) {
        console.log("[PriceService] ⚠️  WARNING: Using simulated prices (PRICE_PROVIDER=simulator)");
        console.log("[PriceService] Set PRICE_PROVIDER=finnhub and add FINNHUB_API_KEY for real prices");
      }

      this.isPolling = true;

      // Fetch immediately
      this.fetchAllPrices();

      // Then poll at interval
      this.intervalId = setInterval(() => {
        this.fetchAllPrices();
      }, intervalSeconds * 1000);
    } catch (error) {
      console.error("[PriceService] Failed to start polling:", error);
      throw error;
    }
  }

  public stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    console.log("[PriceService] Price polling stopped");
  }

  public async getLatestPrices(): Promise<Array<{ symbol: string; price: number; lastUpdated: Date }>> {
    const prices = await StockPrice.find().lean();
    return prices.map((p) => ({
      symbol: p.symbol,
      price: p.price,
      lastUpdated: p.lastUpdated,
    }));
  }

  public getProviderInfo(): { name: string; isSimulator: boolean } {
    return {
      name: priceProviderManager.getProviderName(),
      isSimulator: priceProviderManager.isSimulator(),
    };
  }
}

// Export singleton instance
export const priceService = new PriceService();
