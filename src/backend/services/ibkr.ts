import { IBApi, EventName, ErrorCode } from "@stoqey/ib";
import StockPrice from "../models/StockPrice";

class IBKRService {
  private ib: IBApi;
  private connected: boolean = false;
  private pendingRequests: Map<number, (price: number) => void> = new Map();
  private currentReqId: number = 1;

  constructor() {
    const host = process.env.IBKR_HOST || "127.0.0.1";
    const port = parseInt(process.env.IBKR_PORT || "7497");
    const clientId = parseInt(process.env.IBKR_CLIENT_ID || "1");

    this.ib = new IBApi({
      host,
      port,
    });

    this.setupEventHandlers();

    // Try to connect
    this.connect(clientId);
  }

  private setupEventHandlers(): void {
    // Handle market data
    this.ib.on(EventName.tickPrice, (reqId: number, tickType: number, price: number) => {
      // 4 = Last Price, 9 = Close Price (for pre/post market), 66 = Delayed Last Price
      if ((tickType === 4 || tickType === 9 || tickType === 66) && price > 0) {
        const callback = this.pendingRequests.get(reqId);
        if (callback) {
          callback(price);
          this.pendingRequests.delete(reqId);
          this.ib.cancelMktData(reqId);
        }
      }
    });

    // Handle connection
    this.ib.on(EventName.connected, () => {
      console.log("IBKR TWS connected");
      this.connected = true;
    });

    // Handle disconnection
    this.ib.on(EventName.disconnected, () => {
      console.log("IBKR TWS disconnected");
      this.connected = false;
    });

    // Handle errors
    this.ib.on(EventName.error, (err: Error, code: ErrorCode, reqId: number) => {
      // Ignore subscription errors - delayed data will still work
      if (code === 10089) {
        // Market data subscription required - delayed data is available
        return;
      }
      // Ignore "Can't find EId" errors - these are internal IBKR warnings
      if (code === 300) {
        return;
      }
      if (code === ErrorCode.NO_VALID_ID) {
        console.error("IBKR Error:", err.message);
      } else {
        console.error(`IBKR Error [${code}] reqId ${reqId}:`, err.message);
      }
    });
  }

  private connect(clientId: number): void {
    try {
      this.ib.connect(clientId);
    } catch (error) {
      console.error("Failed to connect to IBKR TWS:", error);
    }
  }

  public async getPrice(symbol: string): Promise<number | null> {
    return new Promise((resolve) => {
      if (!this.connected) {
        console.log("IBKR not connected, skipping price fetch");
        resolve(null);
        return;
      }

      const reqId = this.currentReqId++;
      this.pendingRequests.set(reqId, resolve);

      // Set timeout to cancel request if no response
      setTimeout(() => {
        if (this.pendingRequests.has(reqId)) {
          this.pendingRequests.delete(reqId);
          this.ib.cancelMktData(reqId);
          resolve(null);
        }
      }, 5000);

      try {
        // Request market data for stock
        this.ib.reqMktData(reqId, { symbol, secType: "STK", exchange: "SMART", currency: "USD" }, "", false);
      } catch (error) {
        console.error(`Error requesting market data for ${symbol}:`, error);
        this.pendingRequests.delete(reqId);
        resolve(null);
      }
    });
  }

  public async placeLimitOrder(symbol: string, action: "BUY" | "SELL", quantity: number, limitPrice: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.connected) {
        console.log("IBKR not connected, cannot place order");
        resolve(false);
        return;
      }

      const orderId = this.currentReqId++;

      // Set up order status handler
      const orderStatusHandler = (orderId: number, status: string) => {
        if (status === "Filled" || status === "PartiallyFilled") {
          this.ib.off(EventName.orderStatus, orderStatusHandler);
          resolve(true);
        } else if (status === "Cancelled" || status === "ApiCancelled") {
          this.ib.off(EventName.orderStatus, orderStatusHandler);
          resolve(false);
        }
      };

      this.ib.on(EventName.orderStatus, orderStatusHandler);

      // Timeout after 30 seconds
      setTimeout(() => {
        this.ib.off(EventName.orderStatus, orderStatusHandler);
        resolve(false);
      }, 30000);

      try {
        // Place limit order
        const contract = { symbol, secType: "STK", exchange: "SMART", currency: "USD" };
        const order = {
          action,
          totalQuantity: quantity,
          orderType: "LMT",
          lmtPrice: limitPrice,
        };

        this.ib.placeOrder(orderId, contract, order);
        console.log(`Placed ${action} limit order for ${quantity} shares of ${symbol} at $${limitPrice}`);
      } catch (error) {
        console.error(`Error placing order for ${symbol}:`, error);
        resolve(false);
      }
    });
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public disconnect(): void {
    if (this.connected) {
      this.ib.disconnect();
    }
  }
}

// Export singleton instance
export const ibkrService = new IBKRService();
