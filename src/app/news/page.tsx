import { getFullNewsFeed } from "@/lib/news";
import { NewsFeed } from "@/components/NewsFeed";
import { Newspaper } from "lucide-react";

export default async function NewsPage() {
	// Fetch initial batch (Server Side)
	// We want exactly 5 for the carousel (Hero) and 9 for the feed (Grid) = 14 total
	const initialNews = await getFullNewsFeed(14);

	return (
		<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
			{/* Header (Static) */}
			<div>
				<h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
					<Newspaper className="w-8 h-8" /> Market News
				</h2>
				<p className="text-muted-foreground">Top financial stories from across the US Markets.</p>
			</div>

			{/* Interactive Feed */}
			{initialNews.length > 0 ? (
				<NewsFeed initialNews={initialNews} />
			) : (
				<div className="p-20 text-center text-muted-foreground">
					<h2 className="text-xl font-semibold">No News Found</h2>
					<p>Check back later for market updates.</p>
				</div>
			)}
		</div>
	);
}
