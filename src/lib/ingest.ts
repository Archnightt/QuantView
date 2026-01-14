import { prisma } from './prisma';
import { MarketService } from './market';
import { generateNarrative } from './ai';

// Configuration: How often to refresh the AI narrative?
const NARRATIVE_TTL_HOURS = 12;

export async function ingestTicker(symbol: string, forceUpdate = false) {
  const upperSymbol = symbol.toUpperCase();

  try {
    // 1. Fetch Real-Time Data (Price is always fresh)
    const quoteData = await MarketService.getQuotes([upperSymbol]);
    if (quoteData.length === 0) return null;

    const data = quoteData[0];

    // 2. Check Existing Stock in DB
    const existingStock = await prisma.stock.findUnique({
      where: { symbol: upperSymbol },
    });

    // 3. Decide: Should we regenerate the narrative?
    let narrative = existingStock?.narrative || "Analysis pending...";
    const lastUpdated = existingStock?.lastUpdated ? new Date(existingStock.lastUpdated) : new Date(0);
    const now = new Date();
    
    // Calculate hours since last update
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    const isStale = hoursDiff > NARRATIVE_TTL_HOURS;
    const hasNoNarrative = !existingStock?.narrative || existingStock.narrative === "Analyst unavailable.";

    // ONLY generate AI if it's stale OR empty OR forced
    if (isStale || hasNoNarrative || forceUpdate) {
      console.log(`🤖 AI Cache Expired or Forced for ${upperSymbol} (Age: ${hoursDiff.toFixed(1)}h). Generating new...`);
      narrative = await generateNarrative(
        data.symbol, 
        data.changePercent, 
        data.price, 
        data.headlines || []
      );
    } else {
      console.log(`⚡ Using Cached Narrative for ${upperSymbol} (Age: ${hoursDiff.toFixed(1)}h)`);
    }

    // 4. Save to DB (Update price always, update narrative only if changed)
    const updatedStock = await prisma.stock.upsert({
      where: { symbol: upperSymbol },
      update: {
        price: data.price,
        change: data.changePercent,
        currency: data.currency,
        narrative: narrative,
        lastUpdated: new Date(), // Update timestamp to show "freshness" of price
      },
      create: {
        symbol: data.symbol,
        name: data.name || data.symbol,
        price: data.price,
        change: data.changePercent,
        currency: data.currency,
        narrative: narrative,
      },
    });

    // Attach headlines for UI (they aren't stored in DB in this schema)
    return { ...updatedStock, headlines: data.headlines };

  } catch (error) {
    console.error(`Error ingesting ${upperSymbol}:`, error);
    return null;
  }
}

// Keep the bulk update function for the "Refresh All" button
export async function updateMarketData() {
  console.log('🔄 START: Market data ingestion...');
  
  const stocks = await prisma.stock.findMany();
  if (stocks.length === 0) {
    console.log('⚠️ No stocks in DB to update.');
    return;
  }

  console.log(`📊 Found ${stocks.length} stocks. Updating...`);
  
  // Process sequentially to avoid rate limits
  for (const stock of stocks) {
    await ingestTicker(stock.symbol);
  }

  console.log('🚀 END: Ingestion complete.');
}
