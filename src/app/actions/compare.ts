"use server";

import yahooFinance from "yahoo-finance2";

export interface ComparisonMetric {
  label: string;
  key: string;
  format: (val: number) => string;
}

export interface ComparisonData {
  chartData: any[];
  metrics: {
    metric: string;
    stockA: string | number;
    stockB: string | number;
  }[];
  stockA: { symbol: string; error?: boolean };
  stockB: { symbol: string; error?: boolean };
}

async function fetchStockData(symbol: string) {
  try {
    // Instantiate manually to satisfy the library requirements in this environment
    // @ts-ignore
    const yf = new yahooFinance({ suppressNotices: ['yahooSurvey'] });

    const queryOptions = {
      modules: ["price", "summaryDetail", "defaultKeyStatistics", "financialData"],
    };

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Parallelize the two requests for this single stock
    const [quoteSummary, chartHistory] = await Promise.all([
      yf.quoteSummary(symbol, queryOptions as any),
      yf.chart(symbol, { 
        period1: startDate,
        period2: endDate,
        interval: "1d" 
      }),
    ]);

    return {
      symbol: symbol.toUpperCase(),
      quote: quoteSummary as any,
      history: chartHistory,
      error: false,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return { symbol: symbol.toUpperCase(), error: true };
  }
}

export async function getComparisonData(
  tickerA: string,
  tickerB: string
): Promise<ComparisonData> {
  const [dataA, dataB] = await Promise.all([
    fetchStockData(tickerA),
    fetchStockData(tickerB),
  ]);

  // --- Process Chart Data ---
  const chartDataMap = new Map<string, any>();

  // Helper to normalize history
  const processHistory = (data: any, keyPrefix: string) => {
    if (data.error || !data.history || !data.history.quotes || data.history.quotes.length === 0) return;

    const quotes = data.history.quotes;
    const startPrice = quotes[0].close;

    quotes.forEach((q: any) => {
      // Skip if no close price (some days might have nulls)
      if (!q.close || !q.date) return;
      
      const dateStr = new Date(q.date).toISOString().split("T")[0]; // YYYY-MM-DD
      const pctChange = ((q.close - startPrice) / startPrice) * 100;

      if (!chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, { date: dateStr });
      }
      const entry = chartDataMap.get(dateStr);
      entry[keyPrefix] = pctChange;
      entry[`${keyPrefix}_price`] = q.close; // Store raw price just in case
    });
  };

  processHistory(dataA, "tickerA");
  processHistory(dataB, "tickerB");

  // Sort by date
  const sortedChartData = Array.from(chartDataMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // --- Process Metrics ---
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  };
  
  const formatCurrency = (num: number | undefined, currency: string = "USD") => {
      if (num === undefined || num === null) return "N/A";
       return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
      notation: "compact",
    }).format(num);
  }

  const getMetric = (data: any, path: (d: any) => any, formatter: (v: any, c?: string) => string = formatNumber) => {
    if (data.error) return "-";
    try {
      const val = path(data.quote);
      const currency = data.quote?.price?.currency;
      return formatter(val, currency);
    } catch {
      return "-";
    }
  };

  const metricsList = [
    {
      label: "Market Cap",
      path: (d: any) => d.summaryDetail?.marketCap,
      formatter: formatCurrency, 
    },
    {
      label: "P/E Ratio",
      path: (d: any) => d.summaryDetail?.trailingPE,
      formatter: formatNumber,
    },
    {
      label: "EPS (TTM)",
      path: (d: any) => d.defaultKeyStatistics?.trailingEps,
      formatter: (val: number) => (val ? val.toFixed(2) : "N/A"),
    },
    {
      label: "Beta (5Y)",
      path: (d: any) => d.summaryDetail?.beta,
      formatter: (val: number) => (val ? val.toFixed(2) : "N/A"),
    },
    {
      label: "52W High",
      path: (d: any) => d.summaryDetail?.fiftyTwoWeekHigh,
       formatter: formatCurrency,
    },
  ];

  const metrics = metricsList.map((m) => ({
    metric: m.label,
    stockA: getMetric(dataA, m.path, m.formatter),
    stockB: getMetric(dataB, m.path, m.formatter),
  }));

  return {
    chartData: sortedChartData,
    metrics,
    stockA: { symbol: dataA.symbol, error: dataA.error },
    stockB: { symbol: dataB.symbol, error: dataB.error },
  };
}
