import YahooFinance from "yahoo-finance2";
import { getCurrencySymbol } from "@/lib/utils";
import { fetchWithCache } from "@/lib/redis";

// 1. Initialize the library instance
const yf = new YahooFinance();

export interface MarketData {
	symbol: string;
	name?: string;
	price: number;
	changePercent: number;
	currency?: string;
	headlines?: string[];
}

export const MarketService = {
	async getHeadlines(symbol: string, bypassCache = false): Promise<string[]> {
		return fetchWithCache(`market:headlines:${symbol.toUpperCase()}`, async () => {
			try {
				const result = await yf.search(symbol, { newsCount: 3 });
				if (result.news && result.news.length > 0) {
					return result.news.map((n: any) => n.title);
				}
				return [];
			} catch (error) {
				console.error(`Failed to fetch news for ${symbol}:`, error);
				return [];
			}
		}, 600, { bypassCache }); // Headlines can be cached longer (10 mins)
	},

	/**
	 * Fetches real-time price data for a single symbol
	 */
	async getQuote(symbol: string, bypassCache = false): Promise<MarketData | null> {
		return fetchWithCache(`market:quote:${symbol.toUpperCase()}`, async () => {
			try {
				// 2. Use the instance 'yf' instead of the class
				const quote = await yf.quote(symbol);

				return {
					symbol: symbol.toUpperCase(),
					name: quote.longName || quote.shortName || symbol.toUpperCase(),
					price: quote.regularMarketPrice || 0,
					changePercent: quote.regularMarketChangePercent || 0,
					currency: getCurrencySymbol(quote.currency),
				};
			} catch (error) {
				console.error(`Failed to fetch quote for ${symbol}:`, error);
				return null;
			}
		}, 60, { bypassCache }); // Quotes cached for 1 minute
	},

	/**
	 * Fetches real-time data for multiple symbols at once
	 */
	async getQuotes(symbols: string[], bypassCache = false) {
		const promises = symbols.map(async (s) => {
			const [quote, headlines] = await Promise.all([
				this.getQuote(s, bypassCache),
				this.getHeadlines(s, bypassCache)
			]);
			if (quote) {
				quote.headlines = headlines;
			}
			return quote;
		});
		const results = await Promise.all(promises);
		return results.filter((r) => r !== null) as MarketData[];
	},

  /**
   * Fetches DEEP financial context for AI generation.
   * This retrieves heavy modules like Insider Transactions, Earnings, and Recommendations.
   */
  async getDeepMarketData(symbol: string, bypassCache = false) {
    return fetchWithCache(`market:deep:${symbol.toUpperCase()}`, async () => {
      try {
        const queryOptions = {
          modules: [
            'financialData',          // Margins, Targets
            'defaultKeyStatistics',   // P/E, Beta
            'recommendationTrend',    // Analyst Ratings
            'earnings',               // Earnings History
            'insiderTransactions',    // Insider Buying/Selling
            'upgradeDowngradeHistory' // Recent Analyst Actions
          ]
        };
        // @ts-ignore
        const result = await yf.quoteSummary(symbol, queryOptions);
        return result;
      } catch (error) {
        console.error(`Failed to fetch deep data for ${symbol}:`, error);
        return null;
      }
    }, 3600, { bypassCache }); // Cache for 1 Hour (Data changes slowly)
  }
};
