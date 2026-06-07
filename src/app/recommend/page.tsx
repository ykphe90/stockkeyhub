// src/app/recommend/page.tsx
'use client';

import { useState } from 'react';

type Item = {
  productId: number;
  code: string;
  name: string;
  chineseName: string | null;
  uom: string;
  unitPrice: number;
  minStock: number;
  currentStock: number;
  last7dSales: number;
  last30dSales: number;
  avgDailySales30d: number;
  recommendedQty: number;
  finalQty: number;
  reason: string;
};

const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
];

export default function RecommendPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowTable(false);
    setGeneratedAt(null);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setItems(data.items || []);
      setShowTable(true);
      setGeneratedAt(new Date().toLocaleString());
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalQtyChange = (code: string, value: string) => {
    const qty = parseInt(value, 10) || 0;
    setItems((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, finalQty: qty } : item
      )
    );
  };

  const handleExport = () => {
    // 之后再做真正的 export，这里先占位
    alert('Export coming soon 🙂');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8" dir="ltr">
      <div className="mx-auto max-w-6xl">
        {/* 页面大标题 */}

        {/* 卡片容器 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* 顶部工具栏 */}
          <div className="flex flex-col gap-3 border-b bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-4 text-2xl font-semibold text-gray-900">
                StockKeyHub – AI Purchase Recommendation
              </h1>
              <p className="text-xs text-gray-500 sm:text-[13px]">
                AI suggestions based on recent sales, current stock and minimum
                safety stock.
              </p>
              {generatedAt && (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Last generated at{' '}
                  <span className="font-mono">{generatedAt}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 语言选择 */}
              <select
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>

              {/* Export 按钮（灰色） */}
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100 sm:text-sm"
              >
                Export All
              </button>

              {/* Generate 按钮（橙色，像你给的图右上角） */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Generating…
                  </>
                ) : (
                  'Generate Recommendation'
                )}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700 sm:text-sm">
              {error}
            </div>
          )}

          {/* 表格区域 */}
          <div className="px-3 py-3 sm:px-4 sm:py-4">
            {showTable ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                      <th className="px-3 py-2 text-left">Code</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-3 py-2 text-right">Last 7d</th>
                      <th className="px-3 py-2 text-right">Min Stock</th>
                      <th className="px-3 py-2 text-right">AI Rec</th>
                      <th className="px-3 py-2 text-right">Final Qty</th>
                      <th className="px-3 py-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr
                          key={item.code}
                          className={`border-t text-gray-800 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {item.code}
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            {item.chineseName && (
                              <div className="text-xs text-gray-500">
                                {item.chineseName}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.currentStock} {item.uom}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.last7dSales}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.minStock}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-blue-700">
                            {item.recommendedQty}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={
                                item.finalQty !== undefined ? item.finalQty : ''
                              }
                              onChange={(e) =>
                                handleFinalQtyChange(
                                  item.code,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 align-top">
                            <div className="mt-1 max-w-[320px] whitespace-pre-wrap">
                              {item.reason}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">
                No data yet. Click{' '}
                <span className="font-medium text-gray-700">
                  &quot;Generate Recommendation&quot;
                </span>{' '}
                to start.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
