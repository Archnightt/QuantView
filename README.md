<h1>AlphaDesk – GenAI Powered Market Dashboard</h1>

<table width="100%">
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/b01c7e5b-25fc-4a5b-bd47-53ecd624ea6e" alt="Dashboard Overview" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/d878c665-349c-4d62-b40f-347966dd8258" alt="Stock Details and AI Analysis" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/d4978fb2-5498-4856-addb-1d970642b0a5" alt="Market News View" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/f0abb311-9b0a-4855-a601-74bd4b798003" alt="Mobile Responsive View" width="100%">
    </td>
  </tr>
</table>

**AlphaDesk** is a modern, modular financial analytics dashboard that bridges the gap between raw market data and actionable intelligence. Built with **Next.js App Router** and **TypeScript**, it aggregates real-time data from multiple providers and uses **Generative AI (Gemini)** to synthesize complex financial metrics into natural language investment memos.

## 🚀 Key Features

* **Real-Time Market Data:** Aggregates live pricing, analyst ratings, and insider transactions from Yahoo Finance with sub-second latency.
* **AI Analyst Agent:** A custom RAG (Retrieval-Augmented Generation) pipeline that ingests 5+ distinct data streams to generate deep-dive equity research reports.
* **Bento Grid Architecture:** A modular, drag-and-drop interface built with `dnd-kit` that supports fully persistent layout personalization.
* **High-Performance Caching:** Implements a tiered caching strategy (Upstash Redis) to mask expensive AI operations.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, Server Actions)
* **Language:** TypeScript
* **Database:** PostgreSQL (Prisma ORM)
* **Caching:** Upstash Redis (Serverless)
* **AI Engine:** Google Gemini 2.5 Flash via Vercel AI SDK
* **Styling:** Tailwind CSS, Shadcn/UI
* **State Management:** React Server Components (RSC) + Suspense Streaming

## ⚡ Performance Engineering

One of the core challenges of AlphaDesk was balancing the high latency of Generative AI (RAG pipelines) with the need for a snappy user experience.

**The Problem:**
Generating a "Yahoo-Finance style" deep dive requires fetching 4 separate data modules (Insiders, Financials, News, Ratings) and running a complex LLM prompt.
* *Average Cold Load Time:* **~10.5s**

**The Solution:**
Implemented a Stale-While-Revalidate caching strategy using Upstash Redis to serve cached insights instantly while updating in the background.
* *Average Warm Load Time:* **<200ms**
* *Latency Reduction:* **~98%**

## 🚀 Vercel Deployment
http://alphadesk-one.vercel.app
