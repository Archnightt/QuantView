export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import type { Stock } from "@prisma/client";
import type { ElementType, ReactNode } from "react";
import { HomeNewsBrief, type HomeNewsStory } from "@/components/HomeNewsBrief";
import { MarketIndices } from "@/components/MarketIndices";
import { getDashboardData } from "@/lib/dashboard-data";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  Globe2,
  Landmark,
  Newspaper,
} from "lucide-react";

type MarketQuote = {
  symbol?: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

type CalendarEvent = {
  country?: string;
  impact?: string;
  event?: string;
  date?: string;
  time?: string;
};

type WorldIndexGroups = {
  america?: MarketQuote[];
  europe?: MarketQuote[];
  asia?: MarketQuote[];
};

function formatCurrency(value: number | null | undefined, currency = "$") {
  if (!Number.isFinite(value)) return "-";

  return `${currency}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value as number)}`;
}

function formatNumber(value: number | null | undefined) {
  if (!Number.isFinite(value)) return "-";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value as number);
}

function formatPercent(value: number | null | undefined) {
  if (!Number.isFinite(value)) return "0.00%";

  const numeric = value as number;
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-brand" />
      {children}
    </div>
  );
}

function MetricStrip({
  stocks,
  featuredStock,
  bestMover,
}: {
  stocks: Stock[];
  featuredStock?: Stock;
  bestMover?: Stock;
}) {
  const positiveStocks = stocks.filter((stock) => stock.change >= 0).length;
  const breadth = stocks.length > 0 ? Math.round((positiveStocks / stocks.length) * 100) : 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-border/70 bg-card/65 p-4 shadow-sm backdrop-blur">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Watchlist breadth
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <span className="font-display text-5xl font-semibold leading-none tabular">
            {breadth}%
          </span>
          <span className="pb-1 text-sm text-muted-foreground">
            {positiveStocks} of {stocks.length} green
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/65 p-4 shadow-sm backdrop-blur">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Focus
        </p>
        <p className="mt-3 font-open text-2xl font-bold tracking-tight">
          {featuredStock?.symbol || "-"}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {featuredStock?.name || "No featured stock"}
        </p>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/65 p-4 shadow-sm backdrop-blur">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Biggest watchlist move
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <span className="font-open text-2xl font-bold tracking-tight">
            {bestMover?.symbol || "-"}
          </span>
          <span className={`pb-1 text-sm font-bold tabular ${(bestMover?.change || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {formatPercent(bestMover?.change)}
          </span>
        </div>
      </div>
    </div>
  );
}

function WatchlistTable({ stocks }: { stocks: Stock[] }) {
  if (stocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-card/55 px-6 py-12 text-center text-sm text-muted-foreground">
        No stocks tracked yet. Search from the top bar to build your desk.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card/70 shadow-sm backdrop-blur">
      <div className="grid grid-cols-[1.2fr_0.7fr_0.5fr] border-b border-border/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:grid-cols-[1.3fr_0.7fr_0.5fr_0.8fr]">
        <span>Name</span>
        <span className="text-right">Price</span>
        <span className="text-right">Move</span>
        <span className="hidden text-right md:block">Signal</span>
      </div>

      <div className="divide-y divide-border/60">
        {stocks.slice(0, 10).map((stock) => {
          const isPositive = Number(stock.change) >= 0;
          const narrative = stock.narrative?.replaceAll("\"", "") || "No current note.";

          return (
            <Link
              href={`/stocks/${stock.symbol}`}
              key={stock.symbol}
              className="grid grid-cols-[1.2fr_0.7fr_0.5fr] items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/35 md:grid-cols-[1.3fr_0.7fr_0.5fr_0.8fr]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  {stock.imageUrl ? (
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-white">
                      <Image
                        src={stock.imageUrl}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="32px"
                      />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold">
                      {stock.symbol.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-open text-sm font-bold tracking-tight text-foreground">
                      {stock.symbol}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {stock.name}
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-right font-open text-sm font-bold tabular">
                {formatCurrency(stock.price, stock.currency || "$")}
              </div>

              <div className={`text-right text-xs font-bold tabular ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {formatPercent(stock.change)}
              </div>

              <p className="hidden truncate text-right text-xs leading-5 text-muted-foreground md:block">
                {narrative}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function QuoteList({ title, quotes }: { title: string; quotes: MarketQuote[] }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur">
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">
        {quotes.slice(0, 4).map((quote) => {
          const change = Number(quote.regularMarketChangePercent || 0);
          const isPositive = change >= 0;

          return (
            <div key={quote.symbol} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {quote.shortName || quote.symbol}
                </p>
                <p className="text-xs text-muted-foreground">{quote.symbol}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular">{formatNumber(quote.regularMarketPrice)}</p>
                <p className={`text-xs font-bold tabular ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                  {formatPercent(change)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CrossAssetBoard({ groups }: { groups: Record<string, MarketQuote[]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <QuoteList title="Crypto" quotes={groups.crypto || []} />
      <QuoteList title="Rates" quotes={groups.rates || []} />
      <QuoteList title="Commodities" quotes={groups.commodities || []} />
      <QuoteList title="Currencies" quotes={groups.currencies || []} />
    </div>
  );
}

function WorldMarkets({ groups }: { groups: WorldIndexGroups }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <QuoteList title="Americas" quotes={groups.america || []} />
      <QuoteList title="Europe" quotes={groups.europe || []} />
      <QuoteList title="Asia Pacific" quotes={groups.asia || []} />
    </div>
  );
}

function CalendarBrief({ events }: { events: CalendarEvent[] }) {
  const upcoming = events.slice(0, 6);

  if (upcoming.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-card/60 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur">
        Calendar data is currently unavailable.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card/60 shadow-sm backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_110px] border-b border-border/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:grid-cols-[120px_minmax(0,1fr)_120px_110px]">
        <span className="hidden md:block">Region</span>
        <span>Event</span>
        <span className="hidden text-right md:block">Impact</span>
        <span className="text-right">Time</span>
      </div>
      <div className="divide-y divide-border/60">
        {upcoming.map((event) => (
          <div
            key={`${event.event}-${event.date}-${event.time}`}
            className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-4 px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_120px_110px]"
          >
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground md:block">
              {event.country || "Global"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{event.event}</span>
              <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground md:hidden">
                {event.country || "Global"} / {event.impact || "Medium"}
              </span>
            </span>
            <span className="hidden text-right text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground md:block">
              {event.impact || "Medium"}
            </span>
            <span className="text-right text-xs text-muted-foreground">
              <span className="block">{event.date}</span>
              <span className="block">{event.time}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [stocks, dashboardData] = await Promise.all([
    prisma.stock.findMany({
      orderBy: { lastUpdated: "desc" },
    }),
    getDashboardData(),
  ]);

  const featuredStock = stocks.find((stock) => stock.isFeatured) || stocks[0];
  const bestMover = [...stocks].sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change)
  )[0];

  return (
    <div className="home-dashboard-shell min-h-[calc(100vh-60px)]">
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <section className="space-y-4 border-b border-border/70 pb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel icon={Landmark}>Market indices</SectionLabel>
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
                Market open
              </h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The baseline read before watchlist, headlines, and cross-asset context.
            </p>
          </div>
          <MarketIndices />
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <MetricStrip
              stocks={stocks}
              featuredStock={featuredStock}
              bestMover={bestMover}
            />

            <div>
              <SectionLabel icon={CircleDollarSign}>Watchlist</SectionLabel>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h2 className="font-display text-4xl font-semibold leading-tight">
                  Watchlist
                </h2>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Current pricing, position-level movement, and the latest analyst note for each tracked name.
                </p>
              </div>
              <WatchlistTable stocks={stocks} />
            </div>
          </div>

          <div>
            <SectionLabel icon={Newspaper}>Headlines</SectionLabel>
            <HomeNewsBrief stories={dashboardData.news as HomeNewsStory[]} />
          </div>
        </section>

        <section className="space-y-5 border-t border-border/70 py-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel icon={BriefcaseBusiness}>Cross-asset board</SectionLabel>
              <h2 className="font-display text-4xl font-semibold leading-tight">
                Pressure points
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              A compact read on risk appetite, yields, commodities, and currency movement.
            </p>
          </div>
          <CrossAssetBoard groups={dashboardData.marketSummary as Record<string, MarketQuote[]>} />
        </section>

        <section className="grid gap-8 border-t border-border/70 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <SectionLabel icon={Globe2}>World markets</SectionLabel>
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-4xl font-semibold leading-tight">
                Session map
              </h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Regional equity tone across the Americas, Europe, and Asia Pacific.
              </p>
            </div>
            <WorldMarkets groups={dashboardData.worldIndices as WorldIndexGroups} />
          </div>

          <div>
            <SectionLabel icon={CalendarClock}>Calendar</SectionLabel>
            <CalendarBrief events={dashboardData.calendar as CalendarEvent[]} />
          </div>
        </section>

        <section className="border-t border-border/70 py-8">
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue to full market news
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>
    </div>
  );
}
