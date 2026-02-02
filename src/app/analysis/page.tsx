"use client";

import { useState, useEffect } from "react";
import { getComparisonData, ComparisonData } from "../actions/compare";
import ComparisonChart from "@/components/analysis/ComparisonChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";

export default function AnalysisPage() {
  const [tickerA, setTickerA] = useState("AAPL");
  const [tickerB, setTickerB] = useState("MSFT");
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data function
  const fetchData = async (symA: string, symB: string) => {
    setLoading(true);
    try {
      const result = await getComparisonData(symA, symB);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch comparison data", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData(tickerA, tickerB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerA && tickerB) {
      fetchData(tickerA, tickerB);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Stock Comparison
        </h1>
        <p className="text-muted-foreground">
          Analyze performance and fundamentals side-by-side.
        </p>
      </div>

      {/* Top Section: Inputs */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid w-full gap-2">
              <label className="text-sm font-medium text-muted-foreground">Stock A</label>
              <Input
                value={tickerA}
                onChange={(e) => setTickerA(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground uppercase"
              />
            </div>
            
            <div className="hidden md:flex items-center justify-center pb-3 px-2">
              <span className="text-muted-foreground font-bold">VS</span>
            </div>

            <div className="grid w-full gap-2">
              <label className="text-sm font-medium text-muted-foreground">Stock B</label>
              <Input
                value={tickerB}
                onChange={(e) => setTickerB(e.target.value.toUpperCase())}
                placeholder="e.g. MSFT"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground uppercase"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? <Spinner className="mr-2" size={16} /> : <Search className="mr-2 h-4 w-4" />}
              Compare
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Middle Section: Chart */}
      {data && (
        <ComparisonChart 
          data={data.chartData} 
          tickerA={data.stockA.symbol} 
          tickerB={data.stockB.symbol} 
        />
      )}

      {/* Bottom Section: Head-to-Head Table */}
      {data && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Head-to-Head Fundamentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm text-center">
                <thead className="text-xs uppercase bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 w-1/3 text-right border-b border-border">
                      {data.stockA.symbol}
                    </th>
                    <th className="px-6 py-4 w-1/3 text-center border-b border-border font-bold text-foreground">
                      Metric
                    </th>
                    <th className="px-6 py-4 w-1/3 text-left border-b border-border">
                      {data.stockB.symbol}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.metrics.map((row) => (
                    <tr key={row.metric} className="bg-card hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {row.stockA}
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground font-medium text-xs uppercase tracking-wider">
                        {row.metric}
                      </td>
                      <td className="px-6 py-4 text-left font-medium text-foreground">
                        {row.stockB}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
