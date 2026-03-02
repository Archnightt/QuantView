import { prisma } from './prisma';
import { MarketService } from './market';
import { generateNarrative } from './ai';
import { getLogoUrl } from './utils';

// Configuration: How often to refresh the AI narrative?
const NARRATIVE_TTL_HOURS = 12;

export async function ingestTicker(symbol: string, forceUpdate = false) {
  const upperSymbol = symbol.toUpperCase();

  try {
    // 1. Fetch Real-Time Data (Price is always fresh)
    const quoteData = await MarketService.getQuotes([upperSymbol], forceUpdate);
    if (quoteData.length === 0) return null;

    const data = quoteData[0];

    // 2. Check Existing Stock in DB
    const existingStock = await prisma.stock.findUnique({
      where: { symbol: upperSymbol },
    });

    // 3. Decide: Should we regenerate the narrative OR fetch missing logo?
    let narrative = existingStock?.narrative || "Analysis pending...";
    let imageUrl = existingStock?.imageUrl || null;

    const lastUpdated = existingStock?.lastUpdated ? new Date(existingStock.lastUpdated) : new Date(0);
    const now = new Date();

    // Calculate hours since last update
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    const isStale = hoursDiff > NARRATIVE_TTL_HOURS;
    const hasNoNarrative = !existingStock?.narrative || existingStock.narrative === "Analyst unavailable.";
    const hasNoImage = !existingStock?.imageUrl;

    // Check if we need deep data for AI or Logo
    const needsDeepData = isStale || hasNoNarrative || forceUpdate || hasNoImage;

    // ONLY generate AI if it's stale OR empty OR forced OR we need image
    if (needsDeepData) {

      // FETCH DEEP CONTEXT (RAG)
      const deepData = await MarketService.getDeepMarketData(upperSymbol);

      // Update Logo if missing
      if (hasNoImage && deepData?.summaryProfile?.website) {
        const logo = getLogoUrl(deepData.summaryProfile.website);
        if (logo) imageUrl = logo;
      }

      if (isStale || hasNoNarrative || forceUpdate) {
        const aiStart = performance.now();

        narrative = await generateNarrative({
          symbol: data.symbol,
          price: data.price,
          change: data.changePercent,
          headlines: data.headlines || [],
          financials: deepData?.financialData,
          statistics: deepData?.defaultKeyStatistics,
          recommendations: deepData?.recommendationTrend,
          insiders: deepData?.insiderTransactions,
          earnings: deepData?.earnings
        });

        const aiEnd = performance.now();
      }
    }

    // 4. Save to DB (Update price always, update narrative only if changed)
    const updatedStock = await prisma.stock.upsert({
      where: { symbol: upperSymbol },
      update: {
        price: data.price,
        change: data.changePercent,
        currency: data.currency,
        narrative: narrative,
        imageUrl: imageUrl,
        lastUpdated: new Date(), // Update timestamp to show "freshness" of price
      },
      create: {
        symbol: data.symbol,
        name: data.name || data.symbol,
        price: data.price,
        change: data.changePercent,
        currency: data.currency,
        narrative: narrative,
        imageUrl: imageUrl,
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
  const stocks = await prisma.stock.findMany();
  if (stocks.length === 0) {
    return;
  }

  // Process sequentially to avoid rate limits
  for (const stock of stocks) {
    await ingestTicker(stock.symbol);
  }
}