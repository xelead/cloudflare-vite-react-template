# IBKR TWS Setup Guide

## Prerequisites

1. **Interactive Brokers Account**
   - Sign up at https://www.interactivebrokers.com
   - Complete account verification

2. **Download TWS or IB Gateway**
   - **TWS (Trader Workstation)** - Full GUI application
     - Download: https://www.interactivebrokers.com/en/index.php?f=16457
   - **IB Gateway** - Lightweight, headless API connection
     - Download: https://www.interactivebrokers.com/en/index.php?f=16457
   - For automated trading, IB Gateway is recommended

## Step 1: Install TWS/IB Gateway

### Windows
1. Download the installer from the link above
2. Run the installer and follow the prompts
3. Launch TWS from Start Menu

### Mac
1. Download the DMG file
2. Drag TWS to Applications folder
3. Launch from Applications

### Linux
1. Download the Linux version
2. Extract and run the installer script
3. Launch with `./tws` or `./ibgateway`

## Step 2: Enable API Access

### In TWS:
1. Login to TWS with your IBKR credentials
2. Go to **Edit** → **Global Configuration**
3. Navigate to **API** → **Settings** on the left sidebar
4. Check the following settings:
   - ✅ **Enable ActiveX and Socket Clients**
   - **Socket port**: `7497` (paper trading) or `7496` (live trading)
   - **Master API Client ID**: `0`
   - **Bind to IP**: `127.0.0.1` (localhost only)
   - ❌ **Uncheck "Create API message log"** (optional, for less disk usage)
   - ❌ **Uncheck "Read-Only API"** (required for placing orders)

5. Click **Apply** then **OK**

### Important Security Settings:
- Go to **Edit** → **Global Configuration** → **API** → **Precautions**
- Uncheck "Bypass precautionary settings for API orders" (for safety)
- Set "Order size limit" to a reasonable amount (e.g., 10000)

## Step 3: Paper Trading Account

For testing without real money:

1. Login to TWS with your **paper trading** credentials
   - These are different from your live account
   - Request paper trading access in your IBKR account management

2. The paper trading port is typically **7497**

3. Your paper account starts with **$1,000,000** virtual cash

## Step 4: Configure Environment Variables

Edit your `.env` file:

```env
# Server port
PORT=3003

# Database
MONGODB_URI=mongodb://localhost:27017/stock-trading

# Price Provider (MUST be set explicitly - no fallback)
PRICE_PROVIDER=ibkr

# IBKR Settings (required when PRICE_PROVIDER=ibkr)
IBKR_HOST=127.0.0.1
IBKR_PORT=7497      # 7497 = paper trading, 7496 = live trading
IBKR_CLIENT_ID=1    # Must be unique per connection

# Other providers (only needed if using finnhub or alphavantage)
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here

# Initial cash balance for the app
INITIAL_CASH=7000
```

## Step 5: Start the System

### 1. Start MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Start TWS/IB Gateway
- Launch TWS and login
- Wait for "API connections" message in the bottom status bar
- Or check File → "Connections" → "Configure"

### 3. Start the Backend
```bash
npm run server
```

You should see:
```
IBKR TWS connected
MongoDB connected successfully
Server running on http://localhost:3003
```

### 4. Start the Frontend
```bash
npm run dev
```

Open http://localhost:5173

## Troubleshooting

### "IBKR TWS disconnected" or Connection Refused

1. **TWS not running**: Start TWS and login first
2. **Wrong port**: Check TWS settings (Edit → Global Configuration → API → Settings)
3. **Firewall blocking**: Allow port 7496/7497 through Windows Firewall/Mac Firewall
4. **Client ID conflict**: Change `IBKR_CLIENT_ID` in `.env` to a different number (e.g., 2, 3, etc.)

### "Order rejected" or "Not connected to IBKR"

1. **IBKR not connected**: Ensure TWS/IB Gateway is running and API is enabled
2. **Read-Only API**: Make sure "Read-Only API" is unchecked in TWS settings
3. **Precautionary settings**: Check order size limits in TWS precautions
4. **Market closed**: Some orders may be rejected outside market hours
5. **Insufficient funds**: Check your IBKR account has enough buying power

**Important**: The app will NOT update your local position/cash until IBKR confirms the order. If you see an error, no trade was executed.

### "Price not updating"

1. **No market data subscription**: IBKR requires market data subscriptions
   - Go to Account Management → Market Data Subscriptions
   - Subscribe to "US Securities Snapshot and Futures Value Bundle" (free)
2. **Fallback to Alpha Vantage**: The app automatically falls back to Alpha Vantage if IBKR fails

### "MongoDB connection error"

1. MongoDB not running: Start MongoDB first
2. Wrong URI: Check `MONGODB_URI` in `.env`

## Testing Without IBKR

If you don't have an IBKR account yet, set the simulator provider:

```env
PRICE_PROVIDER=simulator
```

This uses fake/mock prices with random variations for testing. **No real trades will be executed.**

To test with real prices but without IBKR, use:

```env
PRICE_PROVIDER=finnhub
FINNHUB_API_KEY=your_free_key_here  # Get at https://finnhub.io/register
```

## API Client ID Reference

Each connection to TWS needs a unique Client ID:
- Client ID 0: Master/Primary connection (avoid using)
- Client ID 1: Our trading app
- Client ID 2+: Other applications

If you get "Client ID already in use", increment the number in `.env`

## Switching from Paper to Live Trading

1. Stop the backend server
2. Edit `.env`:
   ```env
   IBKR_PORT=7496  # Live trading port
   ```
3. Start TWS with your **live** credentials
4. Start the backend server
5. **Be careful**: Orders will use real money!

## Market Data Subscriptions (Required for IBKR Prices)

IBKR requires subscriptions for real-time data:

**Free Options:**
- US Securities Snapshot and Futures Value Bundle (free)
- Provides snapshot quotes, not streaming

**Paid Options:**
- US Equity and Options Add-On Streaming Bundle ($4.50/month)
- Provides real-time streaming quotes

Without subscriptions, the app will use:
1. Alpha Vantage (if API key provided)
2. Mock prices (fallback)
