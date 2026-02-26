I need a simple stock trading app. On the home page it has trading panels that is configured in a json object that
has tickers. The values are coming from a database. The layout is responsive so if more panels added, it can be on
the same row or go to the next row.  Each panel is stock ticker. Each panel has two buttons: Buy/Sell, label to
display current price, label to display priced bough last, label to display profit (red if loss and green if
profit), textbox to display number of shared.  When user clicks on Buy, it uses limit order to buy the stock at the
shown price with the number specified. When user clicks on sell. It sells all shares of that stock. The backend
should interact with interactive brokers API to get the stock ticker with a timer (no fast streaming is needed) and
buy and sell stocks.
1. Use a local mongodb for database. 2. IBKR TWS API and set that up in the UI. The app should work outside of
   cloudflare workers. If IBKR does not have price data see where you can get it for free.  3. No loging needed. It's
   just me.  4. no validation is needed. Keep the cash, however, in the database and show on the UI. When buying deduct
   from it and when sell it add it back.  5. Yes, cash balande, transactions and positions must all be saved in the database
