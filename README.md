# Crypto Trading Tracker
Google Apps Script for tracking cryptocurrency trades across multiple coins in Google Sheets. I was too lazy to make a sheet manually but this probably took longer 🙌🏾
I used this for a video, so there is a duplicate esque in CS-Lightwork repo but this was the first iteration
## Features

- **Multi-coin support** - separate tab for each cryptocurrency
- **Live price fetching** from CoinGecko API (CAD prices)
- **Automatic calculations**: running totals, average buy price, portfolio value
- **CAD and USD tracking** with automatic conversion
- **Support for BUY and SELL transactions**
- **Interactive menu** for adding trades
- **Clean spreadsheet** with professional formatting

## Requirements

- Google Account (for Google Sheets)
- CoinGecko API Key (free tier available)
  - Sign up at: https://www.coingecko.com/en/api/pricing
  - Free tier: 10,000 calls/month
  - Provides real-time CAD prices for all major cryptocurrencies

## Setup

1. **Get a CoinGecko API Key** (Optional but recommended for live prices)
   - Go to https://www.coingecko.com/en/api/pricing
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier gives you 10,000 calls/month

2. **Create a new Google Sheet**

3. **Open Apps Script**
   - Go to **Extensions > Apps Script**
   - Delete any existing code

4. **Add the script**
   - Copy and paste the entire contents of `crypto-tracker.gs`

5. **Configure your API key**
   - Find this line near the top: `const COINGECKO_API_KEY = 'YOUR_API_KEY_HERE';`
   - Replace `YOUR_API_KEY_HERE` with your actual API key

6. **Add your trades**
   - Find the `COIN_TRADES` object
   - Add your trades following the format shown in the examples

7. **Save the project** (Ctrl+S or Cmd+S)

8. **Return to your Google Sheet and refresh** the page

9. **Use the menu**
   - A "Crypto Tracker" menu will appear in the menu bar
   - Click: **Crypto Tracker > Setup All Coins**
   - Grant permissions when prompted
   - Click: **Crypto Tracker > Populate All Trades**

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

- **API Key**: Requires CoinGecko API key for live prices (free tier: 10,000 calls/month)
  - Get yours at: https://www.coingecko.com/en/api/pricing
  - Alternative: Manually update prices in the summary section
  - Alternative: Modify `getCoinPrice()` to use a different API (CoinCap, CryptoCompare, etc.)
- Portfolio values auto-update with live price from CoinGecko
- All calculations handle both buys and sells
- Timestamps track last update time
- Number formatting applied automatically
- CAD prices fetched directly from CoinGecko (no USD conversion needed)

## License

MIT
