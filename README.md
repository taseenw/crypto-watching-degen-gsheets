# Crypto Trading Tracker

Google Apps Script for tracking cryptocurrency trades across multiple coins in Google Sheets.

## Features

- Multi-coin support - separate tab for each cryptocurrency
- Automatic calculations: running totals, average buy price, portfolio value
- Live price fetching from CoinGecko API
- CAD and USD tracking
- Support for both BUY and SELL transactions
- Interactive menu for adding trades
- No API keys required

## Setup

1. Create a new Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy and paste the entire contents of `crypto-tracker.gs`
5. Save the project
6. Return to your Google Sheet and refresh the page
7. A "Crypto Tracker" menu will appear in the menu bar

## Usage

### Initial Setup

1. Add your trades to the `COIN_TRADES` object in the script:
```javascript
const COIN_TRADES = {
  'SOL': [
    { date: '2025-11-14', type: 'BUY', quantity: 0.99, price: 201.55 },
    { date: '2025-11-17', type: 'BUY', quantity: 0.54, price: 183.91 },
  ],
  'BTC': [
    { date: '2025-12-01', type: 'BUY', quantity: 0.01, price: 125000 },
  ]
};
```

2. Use the menu: **Crypto Tracker > Setup All Coins**
3. Grant permissions when prompted
4. Use the menu: **Crypto Tracker > Populate All Trades**

### Adding New Trades

**Method 1: Via Menu (Recommended)**
1. Navigate to the coin's tab (e.g., SOL)
2. Click **Crypto Tracker > Add New Trade (Current Sheet)**
3. Fill in the prompts

**Method 2: Via Script**
1. Go to **Extensions > Apps Script**
2. Add the trade to `COIN_TRADES`
3. Save and run **Crypto Tracker > Populate All Trades**

### Adding New Coins

1. Add the coin symbol to `COIN_TRADES`
2. Ensure the coin is mapped in `COIN_IDS` (most major coins included)
3. Run **Crypto Tracker > Setup All Coins**
4. Run **Crypto Tracker > Populate All Trades**

## Sheet Structure

Each coin tab contains:
- **Date**: Trade date
- **Type**: BUY or SELL
- **Quantity**: Amount of crypto
- **Price (CAD)**: Price per unit in CAD
- **Total CAD**: Total transaction value in CAD
- **Total USD**: Total transaction value in USD
- **Running Total**: Holdings after each trade
- **Avg Buy Price**: Average purchase price up to that point
- **Portfolio Value (CAD)**: Current value based on live price

### Summary Section

Each tab includes a summary showing:
- Current price (from CoinGecko)
- Total holdings
- Current portfolio value
- Last update timestamp

## Supported Coins

Currently mapped CoinGecko IDs for:
- SOL (Solana)
- BTC (Bitcoin)
- ETH (Ethereum)
- ADA (Cardano)
- DOT (Polkadot)
- AVAX (Avalanche)
- MATIC (Polygon)
- LINK (Chainlink)
- UNI (Uniswap)
- ATOM (Cosmos)

Additional coins can be added by updating the `COIN_IDS` object.

## Configuration

### CAD/USD Exchange Rate
Update the conversion rate in the script:
```javascript
const CAD_TO_USD = 0.72; // Adjust as needed
```

### Adding More Coins
Add CoinGecko IDs to the `COIN_IDS` object:
```javascript
const COIN_IDS = {
  'YOUR_SYMBOL': 'coingecko-id',
};
```

Find CoinGecko IDs at: https://www.coingecko.com/

## Menu Options

- **Setup All Coins**: Creates/resets tabs for all coins
- **Populate All Trades**: Loads all trades from the script
- **Add New Trade (Current Sheet)**: Interactive trade entry for current tab
- **Refresh Price (Current Sheet)**: Updates live price for current tab
- **Refresh All Prices**: Updates live prices for all coins

## Notes

- Uses CoinGecko's free API (no rate limits for occasional use)
- Portfolio values auto-update with live price
- All calculations handle both buys and sells
- Timestamps track last update time
- Number formatting applied automatically

## License

MIT