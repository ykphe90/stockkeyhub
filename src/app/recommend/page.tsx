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
  { value: 'ms', label: 'Malay' },
];

export default function RecommendPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [language, setLanguage] = useState<'en' | 'zh' | 'ms'>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const t: Record<string, Record<string, string>> = {
    en: {
      title: 'StockKeyHub – AI Purchase Recommendation',
      subtitle: 'AI suggestions based on recent sales, current stock and minimum safety stock.',
      lastGenerated: 'Last generated at',
      exportAll: 'Export All',
      generate: 'Generate Recommendation',
      generating: 'Generating…',
      code: 'Code',
      name: 'Name',
      stock: 'Stock',
      last7d: 'Last 7d',
      minStock: 'Min Stock',
      aiRec: 'AI Rec',
      finalQty: 'Final Qty',
      reason: 'Reason',
      noData: 'No data available',
      noDataYet: 'No data yet. Click',
      toStart: 'to start.',
    },
    zh: {
      title: 'StockKeyHub – AI 采购推荐',
      subtitle: '基于近期销售、当前库存和最低安全库存的 AI 建议。',
      lastGenerated: '生成时间',
      exportAll: '导出全部',
      generate: '生成推荐',
      generating: '生成中…',
      code: '编码',
      name: '名称',
      stock: '库存',
      last7d: '近7天',
      minStock: '最低库存',
      aiRec: 'AI 推荐',
      finalQty: '最终数量',
      reason: '原因',
      noData: '暂无数据',
      noDataYet: '暂无数据，点击',
      toStart: '开始。',
    },
    ms: {
      title: 'StockKeyHub – Cadangan Pembelian AI',
      subtitle: 'Cadangan AI berdasarkan jualan terkini, stok semasa dan stok keselamatan minimum.',
      lastGenerated: 'Dijana pada',
      exportAll: 'Eksport Semua',
      generate: 'Jana Cadangan',
      generating: 'Menjana…',
      code: 'Kod',
      name: 'Nama',
      stock: 'Stok',
      last7d: '7 Hari Lepas',
      minStock: 'Stok Minimum',
      aiRec: 'Cadangan AI',
      finalQty: 'Kuantiti Akhir',
      reason: 'Sebab',
      noData: 'Tiada data',
      noDataYet: 'Tiada data lagi. Klik',
      toStart: 'untuk mula.',
    },
  };

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
    // TODO: implement real export, placeholder for now
    alert('Export coming soon 🙂');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8" dir="ltr">
      <div className="mx-auto max-w-6xl">
        {/* Page title */}

        {/* Card container */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Top toolbar */}
          <div className="flex flex-col gap-3 border-b bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-4 text-2xl font-semibold text-gray-900">
                {t[language].title}
              </h1>
              <p className="text-xs text-gray-500 sm:text-[13px]">
                {t[language].subtitle}
              </p>
              {generatedAt && (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {t[language].lastGenerated}
                  <span className="font-mono">{generatedAt}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Language selector */}
              <select
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh' | 'ms')}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>

              {/* Export button */}
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100 sm:text-sm"
              >
                {t[language].exportAll}
              </button>

              {/* Generate button */}
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
                    {t[language].generating}
                  </>
                ) : (
                  t[language].generate
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700 sm:text-sm">
              {error}
            </div>
          )}

          {/* Table area */}
          <div className="px-3 py-3 sm:px-4 sm:py-4">
            {showTable ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                      <th className="px-3 py-2 text-left">{t[language].code}</th>
                      <th className="px-3 py-2 text-left">{t[language].name}</th>
                      <th className="px-3 py-2 text-right">{t[language].stock}</th>
                      <th className="px-3 py-2 text-right">{t[language].last7d}</th>
                      <th className="px-3 py-2 text-right">{t[language].minStock}</th>
                      <th className="px-3 py-2 text-right">{t[language].aiRec}</th>
                      <th className="px-3 py-2 text-right">{t[language].finalQty}</th>
                      <th className="px-3 py-2 text-left">{t[language].reason}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          {t[language].noData}
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
                {t[language].noDataYet}{' '}
                <span className="font-medium text-gray-700">
                  &quot;{t[language].generate}&quot;
                </span>{' '}
                {t[language].toStart}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
