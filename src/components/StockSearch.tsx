"use client";

import * as React from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@/components/ui/dialog"; // Fix accessibility error

// Define the shape of a search result
interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
}

export function StockSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

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
        // Filter out results without symbols
        setResults(data.filter((item: any) => item.symbol));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms delay to prevent spamming

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (symbol: string) => {
    setLoading(true);
    try {
      await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      setOpen(false);
      setQuery("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add stock", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* The Trigger Button (Visible on Dashboard) */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-secondary/50 border border-transparent rounded-lg hover:bg-secondary transition-all w-64"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search ticker... (Cmd + K)</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Stocks</DialogTitle>
        <CommandInput 
          placeholder="Search by symbol or company (e.g. Apple)..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching market...
            </div>
          )}
          
          {!loading && results.length === 0 && query && (
             <CommandEmpty>No markets found.</CommandEmpty>
          )}

          {!loading && results.length > 0 && (
            <CommandGroup heading="Suggestions">
              {results.map((item) => (
                <CommandItem 
                  key={item.symbol} 
                  value={`${item.symbol} ${item.shortname || ''} ${item.longname || ''}`}
                  onSelect={() => handleSelect(item.symbol)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-bold">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground">{item.shortname || item.longname} ({item.exchange})</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
