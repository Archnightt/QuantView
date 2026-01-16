import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface AIContext {
  symbol: string;
  price: number;
  change: number;
  headlines: string[];
  financials?: any;
  statistics?: any;
  recommendations?: any;
  insiders?: any;
  earnings?: any;
}

export async function generateNarrative(context: AIContext) {
  const { symbol, change, price, headlines, financials, statistics, recommendations, insiders, earnings } = context;

  // 1. Fallback for Rate Limits or Missing Key
  if (!genAI) {
     if (Math.abs(change) < 0.5) return `${symbol} is trading flat at $${price}.`;
     return `${symbol} is moving ${change.toFixed(2)}% to $${price}.`;
  }

  const direction = change > 0 ? "UP" : "DOWN";
  const absChange = Math.abs(change);
  const headlineText = headlines.slice(0, 3).join("; ");

  // Extract Key Data Points safely
  const peRatio = statistics?.trailingPE?.fmt || "N/A";
  const targetPrice = financials?.targetMeanPrice?.fmt || "N/A";
  const revenueGrowth = financials?.revenueGrowth?.fmt || "N/A";
  const grossMargins = financials?.grossMargins?.fmt || "N/A";
  
  // Analyst Consensus
  const recs = recommendations?.trend?.[0]; // Get latest month
  const buyCount = (recs?.strongBuy || 0) + (recs?.buy || 0);
  const holdCount = recs?.hold || 0;
  const analystSentiment = buyCount > holdCount ? "Bullish" : "Neutral/Bearish";

  // Insider Activity
  const insiderTx = insiders?.transactions || [];
  const recentInsider = insiderTx.length > 0 
    ? `${insiderTx[0].filerName} (${insiderTx[0].transactionText})` 
    : "No recent significant activity";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a Wall Street Senior Equity Analyst.
      Write a professional, 3-section executive summary for ${symbol}.
      
      ## REAL-TIME DATA
      - Price: $${price} (${direction} ${change.toFixed(2)}%)
      - Key Headlines: ${headlineText}
      
      ## DEEP FUNDAMENTALS (RAG DATA)
      - Valuation: P/E is ${peRatio}. Revenue Growth is ${revenueGrowth}. Gross Margins: ${grossMargins}.
      - Analyst Consensus: ${analystSentiment} (${buyCount} Buys, ${holdCount} Holds). Target Price: ${targetPrice}.
      - Insider Action: ${recentInsider}.
      
      ## INSTRUCTIONS
      Write exactly 3 short paragraphs (plain text, no markdown bolding).
      
      Paragraph 1 (The Move): Explain *why* the stock is moving today. Connect the price action to the headlines or macro trends.
      
      Paragraph 2 (The Fundamentals): Analyze the valuation and growth. Is it expensive? Is it profitable? Reference the P/E and Margins.
      
      Paragraph 3 (The Sentiment): Summarize analyst views and insider behavior. Give a final verdict on the market mood (Bullish/Bearish).
      
      Keep it concise (max 120 words total). Professional financial tone.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().replace(/\*\*/g, '').trim(); // Remove bolding for cleaner plain text

  } catch (error) {
    console.error(`Gemini Error for ${symbol}:`, error);
    return `${symbol} is trading at $${price}. Detailed analysis is currently unavailable.`;
  }
}
