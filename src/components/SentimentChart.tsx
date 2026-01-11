"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import {
  Label,
  PolarRadiusAxis,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

const chartConfig = {
  vix: {
    label: "VIX",
  },
} satisfies ChartConfig

export function SentimentChart({ value }: { value: number }) {
  // 1. Color Logic
  let sentiment = "Neutral";
  let color = "#eab308"; // Yellow default
  let trendIcon = null;

  if (value < 20) {
     sentiment = "Greed";
     color = "#10b981"; // Emerald
     trendIcon = <TrendingUp className="h-4 w-4 text-emerald-500" />;
  } else if (value > 30) {
     sentiment = "Fear";
     color = "#ef4444"; // Red
     trendIcon = <TrendingDown className="h-4 w-4 text-red-500" />;
  }

  // 2. Data Setup
  // We explicitly cap the visual bar at 60 (Max VIX) so it doesn't loop around
  const visualValue = Math.min(value, 60);
  
  const chartData = [
    { name: "vix", value: visualValue, fill: color }
  ];

  return (
    <Card className="flex flex-col border-0 shadow-none bg-transparent h-full">
      <CardHeader className="items-center pb-0 pt-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
           Market Sentiment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={100}
          >
            {/* The Invisible Axis that defines the 0-60 Scale */}
            <PolarAngleAxis
              type="number"
              domain={[0, 60]}
              tick={false}
            />

            {/* The Value Bar */}
            <RadialBar
              dataKey="value"
              background={{ fill: "var(--secondary)" }} // Grey track
              cornerRadius={5}
              fill={color}
              className="stroke-transparent stroke-2"
            />

            {/* The Centered Text Label */}
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10} // Adjusted Y for optical center
                          className="fill-foreground text-3xl font-bold"
                        >
                          {value.toFixed(2)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 10}
                          className="fill-muted-foreground text-xs uppercase tracking-widest"
                        >
                          {sentiment}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm pt-0 pb-4">
        <div className="flex items-center gap-2 leading-none font-medium">
          {sentiment === "Greed" ? "Bullish Outlook" : "Volatility Alert"} {trendIcon}
        </div>
        <div className="text-xs text-muted-foreground leading-none">
          Based on CBOE VIX Index
        </div>
      </CardFooter>
    </Card>
  )
}