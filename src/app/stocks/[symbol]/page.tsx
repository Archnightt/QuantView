import { getStockHistory } from '@/lib/history';
import { getStockDetails, getPeersForSymbol, getPeerQuotes } from '@/lib/stock-data';
import { ingestTicker } from '@/lib/ingest';
import { StockDetailClient } from '@/components/StockDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} — QuantView`,
    description: `Real-time quote, financials, and AI analysis for ${symbol.toUpperCase()}`,
  };
}

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const peerSymbols = getPeersForSymbol(upperSymbol);

  const [stockHistory, stockDetails, stockIngest, peers] = await Promise.all([
    getStockHistory(symbol),
    getStockDetails(symbol),
    ingestTicker(symbol),
    getPeerQuotes(upperSymbol, peerSymbols),
  ]);

  if (!stockDetails || !stockIngest) {
    return (
      <div className="min-h-screen bg-[#0c0d0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[32px] font-mono font-bold text-white mb-2">{upperSymbol}</p>
          <p className="text-zinc-500 font-sans">Stock not found or data unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <StockDetailClient
      stockDetails={stockDetails}
      stockIngest={stockIngest}
      stockHistory={stockHistory || []}
      peers={peers || []}
    />
  );
}
