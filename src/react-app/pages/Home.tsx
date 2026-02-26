import { useState, useEffect, useCallback } from "react";
import TradingPanel from "../components/TradingPanel";
import { getStocks, buyStock, sellStock, getCashBalance, Stock } from "../api/trading";
import "./Home.css";

function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cash, setCash] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [stocksData, cashData] = await Promise.all([
        getStocks(),
        getCashBalance(),
      ]);
      setStocks(stocksData.stocks);
      setCash(cashData.cash);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBuy = async (symbol: string, shares: number) => {
    try {
      await buyStock(symbol, shares);
      setActionError(null);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to buy stock";
      setActionError(message);
      throw err;
    }
  };

  const handleSell = async (symbol: string) => {
    try {
      await sellStock(symbol);
      setActionError(null);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sell stock";
      setActionError(message);
      throw err;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const totalPortfolioValue = stocks.reduce(
    (sum, stock) => sum + stock.currentPrice * stock.shares,
    0
  );

  const totalProfit = stocks.reduce((sum, stock) => sum + stock.profit, 0);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading trading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error">
          Error: {error}
          <br />
          <button onClick={fetchData} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="trading-header">
        <div className="header-content">
          <h1>Stock Trading</h1>
          <div className="portfolio-summary">
            <div className="summary-item">
              <span className="summary-label">Cash</span>
              <span className="summary-value">{formatCurrency(cash)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Portfolio</span>
              <span className="summary-value">{formatCurrency(totalPortfolioValue)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <span className="summary-value">
                {formatCurrency(cash + totalPortfolioValue)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">P/L</span>
              <span
                className={`summary-value ${
                  totalProfit >= 0 ? "profit-positive" : "profit-negative"
                }`}
              >
                {formatCurrency(totalProfit)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {actionError && (
        <div className="action-error" role="alert">
          Order failed: {actionError}
        </div>
      )}

      <section className="trading-grid">
        {stocks.map((stock) => (
          <TradingPanel
            key={stock.symbol}
            symbol={stock.symbol}
            currentPrice={stock.currentPrice}
            lastBuyPrice={stock.lastBuyPrice}
            shares={stock.shares}
            profit={stock.profit}
            onBuy={handleBuy}
            onSell={handleSell}
          />
        ))}
      </section>
    </div>
  );
}

export default Home;
