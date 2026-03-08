"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, TrendingDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const INDEX_NAMES: Record<string, string> = {
    '^GSPC': 'S&P 500',
    '^DJI': 'Dow 30',
    '^IXIC': 'Nasdaq',
    '^GSPTSE': 'S&P/TSX',
    '^BVSP': 'Bovespa',
    '^MXX': 'IPC',
    '^GDAXI': 'DAX',
    '^FTSE': 'FTSE 100',
    '^FCHI': 'CAC 40',
    '^STOXX50E': 'Euro Stoxx 50',
    '^IBEX': 'IBEX 35',
    '^FTSEMIB.MI': 'FTSE MIB',
    '^N225': 'Nikkei',
    '^HSI': 'Hang Seng',
    '^STI': 'ST Index',
    '^NSEI': 'Nifty 50',
    '^SSEC': 'Shanghai',
    '^AXJO': 'ASX 200'
};

export function WorldIndicesWidget({ data }: { data: { america: any[], europe: any[], asia: any[] } }) {
    const [continent, setContinent] = useState<'america' | 'europe' | 'asia'>('america');

    const currentIndices = data[continent] || [];

    return (
        <Card className="h-[400px] flex flex-col shadow-sm dark:bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    World Indices
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs capitalize">
                            {continent}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setContinent('america')}>America</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setContinent('europe')}>Europe</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setContinent('asia')}>Asia</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary px-4 pb-4 space-y-2">
                    {currentIndices.map((item: any) => {
                        const change = item.regularMarketChangePercent || 0;
                        const isPos = change >= 0;
                        return (
                            <div
                                key={item.symbol}
                                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{INDEX_NAMES[item.symbol] || item.symbol}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{item.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-bold tabular-nums">
                                        {item.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPos ? "text-emerald-500" : "text-rose-500"}`}>
                                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {isPos ? "+" : ""}{change.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
