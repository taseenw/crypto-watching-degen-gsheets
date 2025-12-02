/**
 * Crypto Trading Tracker - Google Apps Script
 * 
 * SETUP:
 * Crypto Trading Tracker - Google Apps Script
 * this is .gs just renamed to .js for compatibility
 * holy too lazy to make a spreadsheet lol
 * 
 * SETUP:
 * To be honest go over the readme first, but here are quick steps:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code in there and paste this entire script
 * 4. Add your CoinGecko API key below (see API Key Setup section)
 * 5. Add your trades to COIN_TRADES object below
 * 6. Save (Ctrl+S or Cmd+S)
 * 7. Go back to your sheet and refresh the page
 * 8. Use the custom menu: Crypto Tracker > Setup All Coins
 * 9. Grant permissions when asked
 * 10. Use menu: Crypto Tracker > Populate All Trades
 * 
 * API KEY SETUP:
 * This script uses CoinGecko API to fetch live crypto prices in CAD.
 * - Get a free API key at: https://www.coingecko.com/en/api/pricing
 * - Free tier: 10,000 calls/month (more than enough for personal use)
 * - Once you have your key, paste it below where it says 'YOUR_API_KEY_HERE'
 * 
 * ALTERNATIVE: If you don't want to use CoinGecko, you can:
 * - Remove the getCoinPrice() function calls
 * - Manually enter prices in the summary section
 * - Or modify getCoinPrice() to use a different API (CoinCap, CryptoCompare, etc.)
 * 
 * TO ADD NEW COINS:
 * - Add trades to COIN_TRADES object below
 * - Use menu: Crypto Tracker > Setup All Coins
 * 
 * TO ADD TRADES:
 * - Use menu: Crypto Tracker > Add New Trade (while on that coin's tab)
 * - Or add to COIN_TRADES below and run Populate All Trades
 */

// ============== CONFIGURATION ==============

// CoinGecko API Key - Get yours at https://www.coingecko.com/en/api/pricing
const COINGECKO_API_KEY = 'YOUR_API_KEY_HERE';

// Add all your trades here organized by coin
// Format: { date: 'YYYY-MM-DD', type: 'BUY' or 'SELL', quantity: number, price: price in CAD }
const COIN_TRADES = {
  'SOL': [
    // Example: { date: '2025-11-14', type: 'BUY', quantity: 0.99, price: 201.55 },
  ],
  
  'BTC': [
    // Example: { date: '2025-12-01', type: 'BUY', quantity: 0.01, price: 125000 },
  ],
  
  'ETH': [
    // Example: { date: '2025-12-01', type: 'BUY', quantity: 0.5, price: 4500 },
  ]
  
  // Add more coins as needed
};

// Map coin symbols to CoinGecko IDs (add more as needed)
const COIN_IDS = {
  'SOL': 'solana',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
};

const CAD_TO_USD = 0.72; // Adjust as needed

// ============== MAIN FUNCTIONS ==============

function setupAllCoins() {
  const ui = SpreadsheetApp.getUi();
  
  for (const coinSymbol of Object.keys(COIN_TRADES)) {
    setupSheet(coinSymbol);
  }
  
  ui.alert('All coin tabs created! Now run "Populate All Trades" from the menu.');
}

function setupSheet(coinSymbol) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check if sheet already exists
  let sheet = ss.getSheetByName(coinSymbol);
  if (!sheet) {
    sheet = ss.insertSheet(coinSymbol);
  } else {
    // Sheet exists, just clear it
    sheet.clear();
  }
  
  // Setup headers
  const headers = [
    'Date', 'Type', 'Quantity', 'Price (CAD)', 'Total CAD', 
    'Total USD', 'Running Total', 'Avg Buy Price', 'Portfolio Value (CAD)'
  ];
  
  sheet.getRange('A1:I1').setValues([headers]);
  
  // Format headers
  sheet.getRange('A1:I1')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#e0e0e0');
  
  // Setup summary section
  const summaryLabels = [
    [`${coinSymbol} SUMMARY`],
    ['Current Price (CAD):'],
    ['Total Holdings:'],
    ['Portfolio Value (CAD):'],
    [''],
    ['Last Updated:']
  ];
  
  sheet.getRange('K1:K6').setValues(summaryLabels);
  sheet.getRange('K1:L1')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#cfe2f3');
  
  sheet.getRange('K2:K6').setFontWeight('bold');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 12);
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

function populateAllTrades() {
  const ui = SpreadsheetApp.getUi();
  let totalCoins = 0;
  
  for (const [coinSymbol, trades] of Object.entries(COIN_TRADES)) {
    if (!trades || trades.length === 0) continue;
    
    populateTrades(coinSymbol, trades);
    totalCoins++;
  }
  
  ui.alert(`Populated ${totalCoins} coins!`);
}

function populateTrades(coinSymbol, trades) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(coinSymbol);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${coinSymbol}" not found. Run "Setup All Coins" first.`);
    return;
  }
  
  if (!trades) {
    trades = COIN_TRADES[coinSymbol];
  }
  
  if (!trades || trades.length === 0) {
    return;
  }
  
  // Clear old data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
  }
  
  // Calculate and populate trades
  let runningTotal = 0;
  let totalCost = 0;
  const rows = [];
  
  trades.forEach((trade, index) => {
    const totalCAD = trade.quantity * trade.price;
    const totalUSD = totalCAD * CAD_TO_USD;
    
    if (trade.type.toUpperCase() === 'BUY') {
      runningTotal += trade.quantity;
      totalCost += totalCAD;
    } else { // SELL
      const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
      totalCost -= avgPrice * trade.quantity;
      runningTotal -= trade.quantity;
    }
    
    const avgBuyPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
    const rowNum = index + 2;
    const portfolioFormula = `=G${rowNum}*$L$2`;
    
    rows.push([
      trade.date,
      trade.type.toUpperCase(),
      trade.quantity,
      trade.price,
      totalCAD,
      totalUSD,
      runningTotal,
      avgBuyPrice,
      portfolioFormula
    ]);
  });
  
  // Write all rows at once
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    
    // Format numbers
    sheet.getRange(2, 3, rows.length, 1).setNumberFormat('0.0000'); // Quantity
    sheet.getRange(2, 4, rows.length, 2).setNumberFormat('$0.00'); // Prices & Total CAD
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('$0.00'); // Total USD
    sheet.getRange(2, 7, rows.length, 1).setNumberFormat('0.0000'); // Running Total
    sheet.getRange(2, 8, rows.length, 2).setNumberFormat('$0.00'); // Avg Buy Price
    sheet.getRange(2, 9, rows.length, 1).setNumberFormat('$0.00'); // Portfolio Value
  }
  
  // Update summary
  updateSummary(coinSymbol);
}

function updateSummary(coinSymbol) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = coinSymbol ? ss.getSheetByName(coinSymbol) : ss.getActiveSheet();
  
  if (!coinSymbol) {
    coinSymbol = sheet.getName();
  }
  
  const lastRow = sheet.getLastRow();
  
  // Get live price
  const price = getCoinPrice(coinSymbol);
  
  // Update summary values
  sheet.getRange('L2').setValue(price).setNumberFormat('$0.00');
  
  // Total holdings formula (references last running total)
  if (lastRow > 1) {
    sheet.getRange('L3').setFormula(`=G${lastRow}`).setNumberFormat('0.0000');
  }
  
  // Portfolio value formula
  sheet.getRange('L4').setFormula('=L2*L3').setNumberFormat('$0.00');
  
  // Timestamp
  sheet.getRange('L6').setValue(new Date()).setNumberFormat('yyyy-mm-dd hh:mm');
}

function getCoinPrice(coinSymbol) {
  const coinId = COIN_IDS[coinSymbol];
  
  if (!coinId) {
    Logger.log(`No CoinGecko ID for ${coinSymbol}`);
    return 0;
  }
  
  if (!COINGECKO_API_KEY || COINGECKO_API_KEY === 'YOUR_API_KEY_HERE') {
    Logger.log('CoinGecko API key not configured');
    return 0;
  }
  
  try {
    // Using CoinGecko API with API key as query parameter
    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=cad&ids=${coinId}&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const options = {
      'method': 'get',
      'muteHttpExceptions': true,
      'headers': {
        'Accept': 'application/json'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      Logger.log(`CoinGecko API returned status ${statusCode} for ${coinSymbol}`);
      Logger.log(`Response: ${response.getContentText()}`);
      return 0;
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (data[coinId] && data[coinId].cad) {
      return data[coinId].cad;
    } else {
      Logger.log(`No CAD price found for ${coinSymbol}`);
      return 0;
    }
  } catch (error) {
    Logger.log(`Error fetching ${coinSymbol} price: ` + error);
    return 0;
  }
}

// ============== ADD NEW TRADE MANUALLY ==============

function addNewTradeToCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const coinSymbol = sheet.getName();
  const ui = SpreadsheetApp.getUi();
  
  // Get trade details from user
  const dateResponse = ui.prompt(
    `Add ${coinSymbol} Trade - Date`,
    'Format: YYYY-MM-DD (e.g., 2025-12-01)',
    ui.ButtonSet.OK_CANCEL
  );
  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const typeResponse = ui.prompt(
    `Add ${coinSymbol} Trade - Type`,
    'BUY or SELL',
    ui.ButtonSet.OK_CANCEL
  );
  if (typeResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const qtyResponse = ui.prompt(
    `Add ${coinSymbol} Trade - Quantity`,
    'e.g., 0.5',
    ui.ButtonSet.OK_CANCEL
  );
  if (qtyResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const priceResponse = ui.prompt(
    `Add ${coinSymbol} Trade - Price (CAD)`,
    'e.g., 185.00',
    ui.ButtonSet.OK_CANCEL
  );
  if (priceResponse.getSelectedButton() !== ui.Button.OK) return;
  
  // Parse inputs
  const date = dateResponse.getResponseText();
  const type = typeResponse.getResponseText().toUpperCase();
  const quantity = parseFloat(qtyResponse.getResponseText());
  const price = parseFloat(priceResponse.getResponseText());
  
  // Validate
  if (!date || (type !== 'BUY' && type !== 'SELL') || isNaN(quantity) || isNaN(price)) {
    ui.alert('Invalid input. Please try again.');
    return;
  }
  
  // Add to sheet
  const lastRow = sheet.getLastRow();
  
  // Get previous running total and cost
  let runningTotal = 0;
  let totalCost = 0;
  
  if (lastRow > 1) {
    // Calculate from all previous trades
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 8);
    const data = dataRange.getValues();
    
    data.forEach(row => {
      const prevType = row[1];
      const prevQty = row[2];
      const prevPrice = row[3];
      
      if (prevType === 'BUY') {
        runningTotal += prevQty;
        totalCost += prevQty * prevPrice;
      } else {
        const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
        totalCost -= avgPrice * prevQty;
        runningTotal -= prevQty;
      }
    });
  }
  
  // Calculate new trade
  const totalCAD = quantity * price;
  const totalUSD = totalCAD * CAD_TO_USD;
  
  if (type === 'BUY') {
    runningTotal += quantity;
    totalCost += totalCAD;
  } else {
    const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
    totalCost -= avgPrice * quantity;
    runningTotal -= quantity;
  }
  
  const avgBuyPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
  const newRow = lastRow + 1;
  const portfolioFormula = `=G${newRow}*$L$2`;
  
  // Write new row
  const newData = [[date, type, quantity, price, totalCAD, totalUSD, runningTotal, avgBuyPrice, portfolioFormula]];
  sheet.getRange(newRow, 1, 1, 9).setValues(newData);
  
  // Format the new row
  sheet.getRange(newRow, 3).setNumberFormat('0.0000');
  sheet.getRange(newRow, 4, 1, 2).setNumberFormat('$0.00');
  sheet.getRange(newRow, 6).setNumberFormat('$0.00');
  sheet.getRange(newRow, 7).setNumberFormat('0.0000');
  sheet.getRange(newRow, 8, 1, 2).setNumberFormat('$0.00');
  
  // Update summary
  updateSummary(coinSymbol);
  
  ui.alert(`Added ${type} of ${quantity} ${coinSymbol} @ $${price} CAD\nNew total: ${runningTotal.toFixed(4)} ${coinSymbol}`);
}

function refreshCurrentPrice() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const coinSymbol = sheet.getName();
  updateSummary(coinSymbol);
  SpreadsheetApp.getUi().alert(`${coinSymbol} price refreshed!`);
}

function refreshAllPrices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  for (const coinSymbol of Object.keys(COIN_TRADES)) {
    const sheet = ss.getSheetByName(coinSymbol);
    if (sheet && sheet.getLastRow() > 1) {
      updateSummary(coinSymbol);
    }
  }
  
  ui.alert('All prices refreshed!');
}

// ============== CUSTOM MENU ==============

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Crypto Tracker')
    .addItem('Setup All Coins', 'setupAllCoins')
    .addItem('Populate All Trades', 'populateAllTrades')
    .addSeparator()
    .addItem('Add New Trade (Current Sheet)', 'addNewTradeToCurrentSheet')
    .addSeparator()
    .addItem('Refresh Price (Current Sheet)', 'refreshCurrentPrice')
    .addItem('Refresh All Prices', 'refreshAllPrices')
    .addSeparator()
    .addItem('Test SOL Price', 'testSOLPrice')
    .addToUi();
}

// ============== TEST FUNCTION ==============

function testSOLPrice() {  
  if (!COINGECKO_API_KEY || COINGECKO_API_KEY === 'YOUR_API_KEY_HERE') {
    return;
  }
  
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=cad&ids=solana&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    
    Logger.log('Testing URL: ' + url);
    
    const response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Status Code: ' + statusCode);
    Logger.log('Response: ' + responseText);
    
    if (statusCode === 200) {
      const data = JSON.parse(responseText);
      const solPrice = data.solana.cad;
      
      Logger.log('SOL Price: $' + solPrice + ' CAD');
    } else {
      Logger.log(`API Error\nStatus: ${statusCode}\nResponse: ${responseText}`);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }
}