// src/lib/getProductMetrics.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ProductMetrics = {
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
};

/**
 * 从数据库拉出每个 Product 的库存 & 销量指标，
 * 给 AI 推荐用，也可以直接给前端 UI 用。
 */
export async function getProductMetrics(): Promise<ProductMetrics[]> {
  const products = await prisma.product.findMany({
    include: {
      stockTakes: true,
      sales: true,
    },
  });

  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);

  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);

  const metrics: ProductMetrics[] = products.map((p) => {
    // 最新一次 StockTake 当作 current stock
    const latestStockTake = [...p.stockTakes].sort(
      (a, b) => b.takenAt.getTime() - a.takenAt.getTime()
    )[0];

    const currentStock = latestStockTake?.quantity ?? 0;

    // 最近 7 天销量
    const last7dSales = p.sales
      .filter((s) => s.soldAt >= d7)
      .reduce((sum, s) => sum + s.quantity, 0);

    // 最近 30 天销量
    const last30dSales = p.sales
      .filter((s) => s.soldAt >= d30)
      .reduce((sum, s) => sum + s.quantity, 0);

    const avgDailySales30d =
      last30dSales > 0 ? last30dSales / 30 : 0;

    return {
      productId: p.id,
      code: p.code,
      name: p.name,
      chineseName: (p as any).chineseName ?? null,
      uom: p.uom,
      unitPrice: p.unitPrice,
      minStock: p.minStock,

      currentStock,
      last7dSales,
      last30dSales,
      avgDailySales30d,
    };
  });

  // 让输出稳定一点：按 code 排序
  metrics.sort((a, b) => a.code.localeCompare(b.code));

  return metrics;
}