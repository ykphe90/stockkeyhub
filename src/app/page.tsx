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
          <div className="mb-6 mt-4 flex justify-center">
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

          {/* CTA */}
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 hover:shadow-xl"
          >
            Start Chat
            <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>

          {/* Feature highlights */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/80 px-5 py-5 text-center">
              <div className="mb-2 flex justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Inventory Check</h3>
              <p className="mt-1 text-xs text-gray-400">Real-time stock levels and safety alerts</p>
            </div>
            <div className="rounded-xl bg-white/80 px-5 py-5 text-center">
              <div className="mb-2 flex justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Sales Analysis</h3>
              <p className="mt-1 text-xs text-gray-400">7-day and 30-day trend insights</p>
            </div>
            <div className="rounded-xl bg-white/80 px-5 py-5 text-center">
              <div className="mb-2 flex justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">PO Generation</h3>
              <p className="mt-1 text-xs text-gray-400">Auto-generate purchase orders</p>
            </div>
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
