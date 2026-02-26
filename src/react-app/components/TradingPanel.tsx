import { useState } from "react";
import "./TradingPanel.css";

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
  lastBuyPrice: number;
  shares: number;
  profit: number;
  onBuy: (symbol: string, shares: number) => Promise<void>;
  onSell: (symbol: string) => Promise<void>;
}

function TradingPanel({
  symbol,
  currentPrice,
  lastBuyPrice,
  shares,
  profit,
  onBuy,
  onSell,
}: TradingPanelProps) {
  const [buyShares, setBuyShares] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleBuy = async () => {
    if (buyShares <= 0) return;
    setIsLoading(true);
    setMessage("Sending...");
    try {
      await onBuy(symbol, buyShares);
      setMessage("✓");
      setTimeout(() => setMessage(""), 2000);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to buy";
      setMessage(`✗ ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000); // Show error longer
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (shares <= 0) {
      setMessage("No shares");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    setIsLoading(true);
    setMessage("Sending...");
    try {
      await onSell(symbol);
      setMessage("✓");
      setTimeout(() => setMessage(""), 2000);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to sell";
      setMessage(`✗ ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000); // Show error longer
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isProfit = profit >= 0;
  const profitClass = isProfit ? "profit-positive" : "profit-negative";

  return (
    <div className="trading-panel">
      <span className="ticker-symbol">{symbol}</span>

      <div className="panel-content">
        <div className="price-group">
          <div className="price-item">
            <span className="price-label">Price</span>
            <span className="price-value">{formatCurrency(currentPrice)}</span>
          </div>

          {shares > 0 && (
            <>
              <div className="price-item">
                <span className="price-label">Avg</span>
                <span className="price-value">{formatCurrency(lastBuyPrice)}</span>
              </div>

              <div className="price-item">
                <span className="price-label">P/L</span>
                <span className={`price-value ${profitClass}`}>
                  {formatCurrency(profit)}
                </span>
              </div>

              <div className="price-item">
                <span className="price-label">Shares</span>
                <span className="price-value">{shares}</span>
              </div>
            </>
          )}
        </div>

        <div className="panel-actions">
          <input
            type="number"
            min="1"
            value={buyShares}
            onChange={(e) => setBuyShares(parseInt(e.target.value) || 0)}
            className="shares-input"
            disabled={isLoading}
          />
          <button
            onClick={handleBuy}
            disabled={isLoading || buyShares <= 0}
            className="btn btn-buy"
          >
            Buy
          </button>
          <button
            onClick={handleSell}
            disabled={isLoading || shares <= 0}
            className="btn btn-sell"
          >
            Sell
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default TradingPanel;
