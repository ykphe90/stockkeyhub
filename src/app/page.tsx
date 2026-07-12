import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F2]">
      {/* Header */}
      <header className="border-b-2 border-amber-500 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="11" />
              <line x1="8" y1="16" x2="8" y2="16.01" />
              <line x1="16" y1="16" x2="16" y2="16.01" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">StockKeyHub</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-200">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <line x1="12" y1="7" x2="12" y2="11" />
                <line x1="8" y1="16" x2="8" y2="16.01" />
                <line x1="16" y1="16" x2="16" y2="16.01" />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            AI-Powered Procurement for F&B
          </h1>
          <p className="mb-10 text-base text-gray-500 sm:text-lg">
            Analyze stock levels, predict reorder quantities, and generate purchase orders — all driven by AI.
          </p>

          {/* Feature cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/chat"
              className="group rounded-xl border border-gray-200 bg-white px-6 py-6 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-amber-600">
                Procurement Agent
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
              </h2>
              <p className="text-sm text-gray-500">
                Chat with the AI agent to check inventory, analyze sales trends, and generate purchase orders.
              </p>
            </Link>

            <Link
              href="/recommend"
              className="group rounded-xl border border-gray-200 bg-white px-6 py-6 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h2 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-amber-600">
                AI Stock Analysis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
              </h2>
              <p className="text-sm text-gray-500">
                Get AI-powered purchase recommendations based on current stock, sales data, and safety levels.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        StockKeyHub v0.1.0 &middot; Hybrid AI (Rule Engine + LLM)
      </footer>
    </div>
  );
}
