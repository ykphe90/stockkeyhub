import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
      {/* 顶部标题栏 */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-white lg:p-4 dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:dark:bg-zinc-800/30">
          StockKeyHub&nbsp;
          <code className="font-mono font-bold">v0.1.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <span className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
            F&B Procurement AI
          </span>
        </div>
      </div>

      {/* 核心功能入口区 */}
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-2 lg:text-left gap-6 max-w-5xl w-full">
        
        {/* 卡片 1: AI 采购建议 (核心功能) */}
        <Link
          href="/recommend"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-neutral-800 shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            AI Stock Analysis{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-60 text-balance`}>
            Upload inventory CSV and get AI purchase recommendations instantly.
          </p>
        </Link>

        {/* 卡片 2: 历史订单 (未来功能) */}
        <div
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-200 dark:border-neutral-800 opacity-50 cursor-not-allowed"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            History & Trends{' '}
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded ml-2">Coming Soon</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-60 text-balance`}>
            View past purchase orders and price fluctuation analysis.
          </p>
        </div>

      </div>
    </main>
  );
}