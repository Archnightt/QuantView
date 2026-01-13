export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import yahooFinance from "yahoo-finance2";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { symbol } = body;

		if (!symbol) {
			return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
		}

		const upperSymbol = symbol.toUpperCase();

		// 1. Instantiate Yahoo Finance Properly
		// @ts-ignore
		const yf = new yahooFinance();

		// 2. Fetch Basic Data (Fast)
		// FIX: Cast to any to prevent TypeScript from thinking this is an array
		const quote = (await yf.quote(upperSymbol)) as any;

		if (!quote) {
			return NextResponse.json({ error: "Stock not found" }, { status: 404 });
		}

		let name = quote.longName || quote.shortName || upperSymbol;
		const price = quote.regularMarketPrice || 0;
		const change = quote.regularMarketChangePercent || 0;

		// 3. Create Stock in DB (Skip AI for now)
		const stock = await prisma.stock.create({
			data: {
				symbol: upperSymbol,
				name: name,
				price: price,
				change: change,
				// Set a placeholder so the UI knows it's new
				narrative: "Analysis pending... Click refresh to generate.",
				lastUpdated: new Date(),
			},
		});

		return NextResponse.json(stock);
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Stock already in watchlist" }, { status: 409 });
		}
        // Handle Yahoo Finance "Not Found" or similar errors
        if (error.message && (error.message.includes("Not Found") || error.message.includes("404"))) {
             return NextResponse.json({ error: "Stock not found in market data" }, { status: 404 });
        }
		console.error("Error adding stock:", error);
		return NextResponse.json({ error: "Failed to add stock" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const symbol = searchParams.get("symbol");

		if (!symbol) {
			return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
		}

		await prisma.stock.delete({
			where: { symbol: symbol.toUpperCase() },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
        if (error.code === "P2025") {
            // Record to delete does not exist. Treat as success.
            return NextResponse.json({ success: true });
        }
		console.error("Error deleting stock:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
