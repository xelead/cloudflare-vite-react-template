import { IBApi, EventName, ErrorCode } from "@stoqey/ib";
import StockPrice from "../models/StockPrice";

export interface OrderPlacementResult {
  success: boolean;
  orderId: number;
  reason?: string;
}

class IBKRService {
  private ib: IBApi;
  private connected: boolean = false;
  private pendingRequests: Map<number, (price: number) => void> = new Map();
  private currentMarketDataReqId: number = 1;
  private nextOrderId: number | null = null;

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
      this.nextOrderId = null;

      try {
        this.ib.reqIds();
      } catch (error) {
        console.error("Failed to request next valid order id from IBKR:", error);
      }
    });

    // Handle disconnection
    this.ib.on(EventName.disconnected, () => {
      console.log("IBKR TWS disconnected");
      this.connected = false;
      this.nextOrderId = null;
    });

    this.ib.on(EventName.nextValidId, (orderId: number) => {
      this.nextOrderId = orderId;
      console.log(`IBKR next valid order id: ${orderId}`);
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

      const reqId = this.currentMarketDataReqId++;
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

  private async reserveOrderId(): Promise<number | null> {
    if (!this.connected) {
      return null;
    }

    if (this.nextOrderId === null) {
      try {
        this.ib.reqIds();
      } catch (error) {
        console.error("Failed to request order id from IBKR:", error);
        return null;
      }

      await new Promise<void>((resolve) => {
        const startedAt = Date.now();
        const interval = setInterval(() => {
          if (this.nextOrderId !== null) {
            clearInterval(interval);
            resolve();
            return;
          }

          if (Date.now() - startedAt >= 5000) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    if (this.nextOrderId === null) {
      return null;
    }

    const orderId = this.nextOrderId;
    this.nextOrderId += 1;
    return orderId;
  }

  public async placeLimitOrder(
    symbol: string,
    action: "BUY" | "SELL",
    quantity: number,
    limitPrice: number
  ): Promise<OrderPlacementResult> {
    return new Promise((resolve) => {
      if (!this.connected) {
        const reason = "IBKR not connected, cannot place order";
        console.error(`[IBKR ORDER] ${reason}`, { symbol, action, quantity, limitPrice });
        resolve({ success: false, orderId: -1, reason });
        return;
      }

      let settled = false;
      let orderId = -1;

      const finish = (result: OrderPlacementResult) => {
        if (settled) {
          return;
        }
        settled = true;
        this.ib.off(EventName.orderStatus, orderStatusHandler);
        this.ib.off(EventName.error, orderErrorHandler);
        resolve(result);
      };

      // Set up order status handler
      const orderStatusHandler = (eventOrderId: number, status: string) => {
        if (eventOrderId !== orderId) {
          return;
        }

        console.log(`[IBKR ORDER] ${action} ${symbol} order ${orderId} status: ${status}`);

        if (status === "Filled" || status === "PartiallyFilled") {
          finish({ success: true, orderId, reason: `Order status: ${status}` });
          return;
        }

        if (status === "Cancelled" || status === "ApiCancelled" || status === "Inactive") {
          finish({ success: false, orderId, reason: `Order status: ${status}` });
        }
      };

      const orderErrorHandler = (err: Error, code: ErrorCode, reqId: number) => {
        if (reqId !== orderId) {
          return;
        }

        const reason = `IBKR error [${code}] for order ${orderId}: ${err.message}`;
        console.error("[IBKR ORDER]", reason, { symbol, action, quantity, limitPrice });
        finish({ success: false, orderId, reason });
      };

      const placeOrder = async () => {
        const reservedOrderId = await this.reserveOrderId();
        if (reservedOrderId === null) {
          const reason = "Unable to reserve a valid order id from IBKR";
          console.error("[IBKR ORDER]", reason, { symbol, action, quantity, limitPrice });
          finish({ success: false, orderId: -1, reason });
          return;
        }

        orderId = reservedOrderId;
        this.ib.on(EventName.orderStatus, orderStatusHandler);
        this.ib.on(EventName.error, orderErrorHandler);

        // Timeout after 30 seconds
        setTimeout(() => {
          const reason = `Order timed out after 30 seconds (orderId: ${orderId})`;
          console.error("[IBKR ORDER]", reason, { symbol, action, quantity, limitPrice });
          finish({ success: false, orderId, reason });
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
          finish({ success: false, orderId, reason: "Failed to place order with IBKR API" });
        }
      };

      void placeOrder();
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
