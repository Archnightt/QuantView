import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Activity, TrendingUp, PieChart } from "lucide-react";

function formatNumber(num: number) {
  if (!num) return "N/A";
  if (num > 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num > 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num > 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toLocaleString();
}

function formatPercent(num: number) {
  return num ? (num * 100).toFixed(2) + "%" : "N/A";
}

export function FinancialsWidget({ data }: { data: any }) {
  if (!data) return null;

  const metrics = [
    { label: "Market Cap", value: formatNumber(data.marketCap), icon: DollarSign },
    { label: "Revenue (TTM)", value: formatNumber(data.revenue), icon: Activity },
    { label: "EBITDA", value: formatNumber(data.ebitda), icon: TrendingUp },
    { label: "P/E Ratio", value: data.peRatio?.toFixed(2), icon: PieChart },
    { label: "Profit Margin", value: formatPercent(data.profitMargin), icon: Activity },
    { label: "Debt/Equity", value: data.debtToEquity + "%", icon: DollarSign },
    { label: "Beta (Volatility)", value: data.beta?.toFixed(2), icon: Activity },
    { label: "Target Price", value: data.targetPrice ? "$" + data.targetPrice : "N/A", icon: TrendingUp },
  ];

  return (
    <Card className="h-full border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Financial Fundamentals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="p-3 rounded-lg bg-secondary/10 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <m.icon className="w-3 h-3" />
                <span className="text-xs font-medium uppercase">{m.label}</span>
              </div>
              <div className="text-lg font-bold">{m.value || "—"}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
