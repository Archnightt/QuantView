"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

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
			className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
			title="Remove from watchlist"
		>
			{isLoading ? (
				<div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
			) : (
				<TrashIcon className="w-4 h-4" />
			)}
		</button>
	);
}
