import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    // 1. Transaction: Unset all featured stocks, then set the new one
    await prisma.$transaction([
      // Reset all to false
      prisma.stock.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      }),
      // Set the chosen one to true
      prisma.stock.update({
        where: { symbol },
        data: { isFeatured: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to feature stock:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
