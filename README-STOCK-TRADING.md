# Stock Trading App

A simple stock trading application with Interactive Brokers (IBKR) TWS API integration.

## Features

- Trading panels for configured stocks
- Real-time price updates (via IBKR TWS or fallback APIs)
- Buy/Sell functionality with limit orders
- Cash balance tracking
- Portfolio value and P/L calculation
- Transaction history

## Prerequisites

1. **MongoDB** - Install and run locally:
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or download from https://www.mongodb.com/try/download/community
   ```

2. **Interactive Brokers TWS** (Optional - for real trading):
   - Download TWS from https://www.interactivebrokers.com/en/index.php?f=16457
   - Enable API in TWS: Edit → Global Configuration → API → Settings
   - Enable "ActiveX and Socket Clients"
   - Set Socket port: 7497 (paper) or 7496 (live)
   - Uncheck "Read-Only API"

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   # Required: Choose price provider (ibkr, finnhub, alphavantage, simulator)
   PRICE_PROVIDER=ibkr

   # Required for IBKR:
   IBKR_HOST=127.0.0.1
   IBKR_PORT=7497
   IBKR_CLIENT_ID=1

   # Required for Finnhub (if PRICE_PROVIDER=finnhub):
   FINNHUB_API_KEY=your_key_here

   # Required for Alpha Vantage (if PRICE_PROVIDER=alphavantage):
   ALPHA_VANTAGE_API_KEY=your_key_here

   # Other settings:
   MONGODB_URI=mongodb://localhost:27017/stock-trading
   PORT=3001
   INITIAL_CASH=100000
   ```

3. Configure tickers in `src/backend/config/tickers.json`:
   ```json
   {
     "tickers": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"]
   }
   ```

## Running the App

### Development Mode

1. Start the backend server:
   ```bash
   npm run server
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Backend Only

```bash
npm run dev:server
```

The backend API will be available at http://localhost:3001

## API Endpoints

- `GET /api/config` - Get ticker configuration
- `GET /api/stocks` - Get all stocks with prices and positions
- `POST /api/stocks/:symbol/buy` - Buy shares (body: `{ shares: number }`)
  - Returns `503` if not connected to IBKR
  - Returns `502` if order rejected by IBKR
  - Returns `200` only after IBKR confirms the order
- `POST /api/stocks/:symbol/sell` - Sell all shares
  - Returns `503` if not connected to IBKR
  - Returns `502` if order rejected by IBKR
  - Returns `200` only after IBKR confirms the order
- `GET /api/cash` - Get cash balance
- `GET /api/transactions` - Get transaction history

## Architecture

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database for positions, transactions, cash balance
- **Mongoose** - ODM for MongoDB
- **@stoqey/ib** - IBKR TWS API wrapper
- **node-cron** - Price polling

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety

### Data Models

#### Position
- `symbol` - Stock ticker
- `shares` - Number of shares owned
- `avgBuyPrice` - Average buy price
- `lastBuyPrice` - Price of last purchase

#### Transaction
- `symbol` - Stock ticker
- `type` - "BUY" or "SELL"
- `shares` - Number of shares
- `price` - Price per share
- `total` - Total value
- `timestamp` - When transaction occurred

#### CashBalance
- `amount` - Current cash available

#### StockPrice
- `symbol` - Stock ticker
- `price` - Current price
- `lastUpdated` - When price was last fetched

## Notes

- **Price Provider**: You MUST explicitly set `PRICE_PROVIDER` in your `.env` file:
  - `PRICE_PROVIDER=ibkr` - Uses Interactive Brokers (TWS/Gateway must be running)
  - `PRICE_PROVIDER=finnhub` - Uses Finnhub API (requires `FINNHUB_API_KEY`)
  - `PRICE_PROVIDER=alphavantage` - Uses Alpha Vantage API (requires `ALPHA_VANTAGE_API_KEY`)
  - `PRICE_PROVIDER=simulator` - Uses fake/mock prices for testing

- **No Fallback**: If the configured provider fails, the app will NOT fall back to another provider. It will error out and stop polling.

- **Order Confirmation**: Buy/Sell orders are ONLY executed after IBKR confirms the order. The app will:
  - Return `503` error if not connected to IBKR
  - Return `502` error if IBKR rejects the order
  - Wait for IBKR confirmation before updating local position/cash

- Prices are polled every 30 seconds
- The frontend polls the backend every 5 seconds for updates
- Cash balance is initialized to $100,000 on first run (or `INITIAL_CASH`)
- All data persists in MongoDB

## Troubleshooting

### MongoDB Connection Error
Make sure MongoDB is running:
```bash
docker ps  # Check if MongoDB container is running
```

### IBKR Connection Error
- Ensure TWS/IB Gateway is running
- Check API is enabled in TWS settings
- Verify port matches (7496 for live, 7497 for paper)
- Make sure the client ID is not already in use
- Ensure `PRICE_PROVIDER=ibkr` is set in your `.env` file

### Price Provider Error
- Check `PRICE_PROVIDER` is set correctly in `.env`
- If using `finnhub` or `alphavantage`, ensure the corresponding API key is set
- The app will NOT fall back to another provider if the configured one fails
- Use `PRICE_PROVIDER=simulator` for testing without external APIs

### Port Already in Use
Change the PORT in `.env` to a different number (e.g., 3002)
