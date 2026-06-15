# StockKeyHub — F&B Procurement AI (Frontend)

An AI-powered procurement recommendation system for the F&B industry. This is the **frontend + API gateway** built with Next.js 15, connecting to a Python FastAPI backend for intelligent stock analysis.

> Part of a two-repo architecture: this repo handles UI and data layer; [StockKeyHub-v2](https://github.com/pheyk/StockKeyHub-v2) handles the AI engine.

## What It Does

Restaurant procurement managers input their inventory data — the system analyzes stock levels, sales trends, and reorder urgency, then returns actionable purchase recommendations with structured explanations in English, Chinese, or Malay.

## Architecture

```
┌─────────────────────────────────────────────┐
│  StockKeyHub v1 (this repo)                 │
│  Next.js 15 · Prisma · SQLite               │
│                                              │
│  /recommend      → Procurement dashboard     │
│  /api/recommend   → Proxy to Python backend   │
│  /lib/getProductMetrics → DB queries          │
└──────────────┬──────────────────────────────┘
               │  HTTP (JSON)
               ▼
┌─────────────────────────────────────────────┐
│  StockKeyHub v2 (separate repo)             │
│  Python · FastAPI · OpenAI                   │
│                                              │
│  Rule Engine → LLM Enhancement → Response    │
│  Function Calling Agent (in progress)        │
└─────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite via Prisma ORM
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: Inline translation map (EN / ZH / MS)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# 3. Configure environment
cp .env.example .env
# Add your API keys to .env

# 4. Start the Python backend (separate repo)
# See StockKeyHub-v2 README

# 5. Run the dev server
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── recommend/page.tsx       # Procurement dashboard (i18n)
│   └── api/recommend/route.ts   # API proxy → Python backend
├── lib/
│   ├── getProductMetrics.ts     # Prisma DB queries
│   └── prompts/                 # Prompt templates
└── i18n/
    └── settings.ts              # i18n configuration
```

## Related

- [StockKeyHub-v2](https://github.com/pheyk/StockKeyHub-v2) — Python FastAPI AI backend
