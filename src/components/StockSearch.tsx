"use client";

import * as React from "react";
import { Search, Loader2, TrendingUp, Building2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Define the shape of a search result
interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  typeDisp?: string;
}

export function StockSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Toggle with Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced Search Effect
  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.filter((item: any) => item.symbol));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast({
            title: "Already in Watchlist",
            description: `${symbol.toUpperCase()} is already in your dashboard.`,
          });
          setOpen(false);
          setQuery("");
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add stock");
      }

      setOpen(false);
      setQuery("");
      toast({
        title: "Stock Added",
        description: `Successfully added ${symbol} to your watchlist.`,
      });
      router.refresh();
    } catch (error: any) {
      console.error("Failed to add stock", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not add stock. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate a consistent color based on string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  return (
    <>
      {/* Sleek Search Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground bg-card border border-border/40 rounded-full shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 w-full"
      >
        <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left truncate">Search markets, companies, or symbols...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Stocks</DialogTitle>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
          className="text-base"
        />
        <CommandList className="max-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <span className="text-sm">Scanning market data...</span>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              No results found for "{query}".
            </CommandEmpty>
          )}

          {!loading && results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((item) => {
                const color = stringToColor(item.symbol);
                return (
                  <CommandItem
                    key={item.symbol}
                    value={`${item.symbol} ${item.shortname || ''} ${item.longname || ''}`}
                    onSelect={() => handleSelect(item.symbol)}
                    className="cursor-pointer py-3 px-4 aria-selected:bg-accent aria-selected:text-accent-foreground rounded-lg my-1 mx-2"
                  >
                    {/* Visual Indicator / Pseudo-Logo */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full mr-4 text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {item.symbol.substring(0, 1)}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate text-base">{item.symbol}</span>
                        {item.exchange && (
                          <span className="text-[10px] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {item.exchange}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">
                        {item.shortname || item.longname || "Unknown Company"}
                      </span>
                    </div>

                    <div className="ml-auto">
                      <TrendingUp className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
