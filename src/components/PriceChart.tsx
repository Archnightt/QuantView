"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function PriceChart({ data, range = '1mo' }: { data: any[], range?: string }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-muted-foreground">No Data</div>

  // Calculate min/max for better axis scaling
  const prices = data.map(d => d.price)
  const minPrice = Math.min(...prices) * 0.999
  const maxPrice = Math.max(...prices) * 1.001

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value)
              
              if (range === '1d') {
                return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
              }
              if (range === '1w') {
                return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", hour: "numeric" })
              }
              if (range === '1y') {
                 return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
              }

              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <YAxis 
             domain={[minPrice, maxPrice]} 
             tickLine={false}
             axisLine={false}
             tickFormatter={(value) => `$${value.toFixed(2)}`}
             width={60}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" hideLabel />}
          />
          <Area
            dataKey="price"
            type="monotone"
            fill="url(#fillPrice)"
            stroke="var(--color-price)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}