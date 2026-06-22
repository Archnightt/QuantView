"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteButton({ symbol }: { symbol: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!confirm(`Are you sure you want to remove ${symbol}?`)) return;
		
		setIsLoading(true);
		try {
			const res = await fetch(`/api/stocks?symbol=${symbol}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete");
			router.refresh();
		} catch (error) {
			console.error("Failed to delete stock:", error);
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleDelete}
			disabled={isLoading}
			className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500 disabled:pointer-events-none disabled:opacity-60"
			title="Remove from watchlist"
			aria-label={`Remove ${symbol} from watchlist`}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Trash2 className="h-4 w-4" />
			)}
		</button>
	);
}
