<h1>AlphaDesk – GenAI Powered Market Dashboard</h1>

AlphaDesk is a modern, modular financial dashboard designed to provide retail investors with institutional-grade market overviews. It features a fully customizable drag-and-drop interface, real-time data visualization, and an intelligent news aggregation engine that bypasses standard API rate limits to deliver comprehensive market coverage.

🚀 **Key Features**
Customizable Workspace: Built with @dnd-kit, users can drag, drop, and reorder widgets (Charts, News, Sectors) to create a personalized layout. State is persisted locally for a consistent experience.

**Smart News Aggregator:** Implements a custom "Multi-Index Aggregation" algorithm. It queries S&P 500, Dow Jones, and Nasdaq streams simultaneously, deduplicates stories by UUID, and merges them to overcome third-party API pagination limits.

**Real-Time Market Data:** Live tracking of major indices, sector performance heatmaps, and VIX (Volatility Index) sentiment analysis.

**Watchlist Management:** Persistent portfolio tracking using a PostgreSQL database (via Docker) and Prisma ORM.

**Responsive Visualization:** Interactive financial charts powered by shadcn.

<img width="1188" height="918" alt="mock8" src="https://github.com/user-attachments/assets/15021318-e397-4b3b-8b4c-980e772ce8b3" />

<img width="1185" height="918" alt="final2" src="https://github.com/user-attachments/assets/96869d6c-21a2-4986-91d9-ed8e68be25ac" />

<img width="1105" height="910" alt="final" src="https://github.com/user-attachments/assets/f0abb311-9b0a-4855-a601-74bd4b798003" />


🛠️ **Tech Stack**

Frontend: Next.js 16 (App Router & Turbopack), React 19, Tailwind CSS.

Backend / Data: Server Actions, Prisma ORM.

Database: PostgreSQL (Containerized via Docker).

State Management: React Hooks & LocalStorage for layout persistence.

APIs: Yahoo Finance (yahoo-finance2).

Deployment: Vercel & Neon (Database).