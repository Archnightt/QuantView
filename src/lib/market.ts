import YahooFinance from "yahoo-finance2";
import { getCurrencySymbol } from "@/lib/utils";

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
	async getHeadlines(symbol: string): Promise<string[]> {
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
	},

	/**
	 * Fetches real-time price data for a single symbol
	 */
	async getQuote(symbol: string): Promise<MarketData | null> {
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
	},

	/**
	 * Fetches real-time data for multiple symbols at once
	 */
	async getQuotes(symbols: string[]) {
		const promises = symbols.map(async (s) => {
			const [quote, headlines] = await Promise.all([
				this.getQuote(s),
				this.getHeadlines(s)
			]);
			if (quote) {
				quote.headlines = headlines;
			}
			return quote;
		});
		const results = await Promise.all(promises);
		return results.filter((r) => r !== null) as MarketData[];
	},
};
