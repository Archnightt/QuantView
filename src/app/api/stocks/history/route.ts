import { NextResponse } from "next/server";
import { getStockHistory } from "@/lib/history";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const rawSymbol = searchParams.get("symbol");
	const range = (searchParams.get("range") || "1mo") as any;

	if (!rawSymbol) {
		return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
	}

	const symbol = rawSymbol.toUpperCase();

	try {
		const history = await getStockHistory(symbol, range);
		
		// Map to the format expected by the frontend if necessary
		// Original format used 'time' instead of 'date'
		const formattedHistory = history.map(item => ({
			time: item.date,
			price: item.price
		}));

		return NextResponse.json(formattedHistory);
	} catch (error) {
		console.error(`History API Error for ${symbol}:`, error);
		return NextResponse.json([]);
	}
}