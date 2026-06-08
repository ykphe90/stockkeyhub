// src/app/api/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProductMetrics } from '@/lib/getProductMetrics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const lang = (body.language as string) || 'en';

    // get product metrics
    const metrics = await getProductMetrics();

    // prepare AI payload (convert to snake_case for Python API)
    const aiInput = metrics.map((m) => ({
      product_id: m.productId,
      code: m.code,
      name: m.name,
      chinese_name: m.chineseName,
      uom: m.uom,
      unit_price: m.unitPrice,
      min_stock: m.minStock,
      current_stock: m.currentStock,
      last_7d_sales: m.last7dSales,
      last_30d_sales: m.last30dSales,
      avg_daily_sales_30d: m.avgDailySales30d,
      reason: 'AI did not provide a reason.',
    }));

    const systemLang = lang === 'zh' ? 'Chinese' : lang ==='en' ? 'English' : 'Malay';
    const response = await fetch('http://localhost:8000/api/v1/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: aiInput,
            language: lang,
        }),
    });
    
    if (!response.ok) throw new Error('Python API failed');
    
    const data = await response.json();
    const recs = data.recommendations || [];
  
    // merge with original metrics
    const merged = metrics.map((m) => {
      const r = recs.find((x: any) => x.code === m.code);
      return {
        ...m,
        recommendedQty: r?.qty ?? 0,
        reason: r?.reason?.explanation ?? 'AI did not provide a reason.',
      };
    });

    return NextResponse.json({ items: merged });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    // fallback: if Python API fails, return raw data to prevent blank screen
    const metrics = await getProductMetrics();
    return NextResponse.json({ items: metrics, error: 'AI unavailable' });
  }
}
