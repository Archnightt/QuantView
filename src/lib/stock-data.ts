import yahooFinance from 'yahoo-finance2';

export async function getStockDetails(symbol: string) {
  try {
    // Instantiate manually to satisfy the library requirements in this environment
    // @ts-ignore
    const yf = new yahooFinance();
    
    const queryOptions = { 
      modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'] 
    };
    
    // Fetch detailed modules
    const result = await yf.quoteSummary(symbol, queryOptions);
    
    // Fetch Specific Company News (Rich Media)
    const newsResult = await yf.search(symbol, { newsCount: 5, quotesCount: 0 });
    
    const data = result as any;
    
    return {
      symbol,
      price: data.price?.regularMarketPrice?.raw || data.price?.regularMarketPrice || 0,
      summary: data.summaryDetail,
      // Map the financials to a clean object
      financials: {
        marketCap: data.summaryDetail?.marketCap,
        peRatio: data.summaryDetail?.trailingPE,
        pegRatio: data.defaultKeyStatistics?.pegRatio,
        revenue: data.financialData?.totalRevenue,
        profitMargin: data.financialData?.profitMargins,
        ebitda: data.financialData?.ebitda,
        grossProfits: data.financialData?.grossProfits,
        debtToEquity: data.financialData?.debtToEquity,
        targetPrice: data.financialData?.targetMeanPrice,
        beta: data.defaultKeyStatistics?.beta,
        bookValue: data.defaultKeyStatistics?.bookValue,
        shortRatio: data.defaultKeyStatistics?.shortRatio,
      },
      // Map news to our standard format
      news: (newsResult.news || []).map((item: any) => ({
        uuid: item.uuid,
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        providerPublishTime: item.providerPublishTime,
        thumbnail: item.thumbnail,
        summary: item.summary || item.snippet || "" 
      }))
    };
  } catch (error) {
    console.error("Failed to fetch stock details:", error);
    return null;
  }
}
