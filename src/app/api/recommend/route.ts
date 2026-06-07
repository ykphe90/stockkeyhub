// src/app/api/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProductMetrics } from '@/lib/getProductMetrics';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const lang = (body.language as string) || 'en';

    // 1. 获取基础数据
    const metrics = await getProductMetrics();

    // 2. 准备 AI Payload (精简字段以节省 Token)
    const aiInput = metrics.map((m) => ({
      code: m.code,
      name: m.name,
      current: m.currentStock, // 缩短 key 名字节省 token
      sales7d: m.last7dSales,
      min: m.minStock,
    }));

    const systemLang = lang === 'zh' ? 'Chinese' : 'English';

    // 3. 构造 Prompt
    const prompt = `
    Role: Expert F&B Procurement Advisor.
    Language: Respond in ${systemLang}.
    Task: Analyze stock levels and recommend purchase quantities.

    Rules:
    - If current < min, you MUST recommend buying.
    - If sales7d is high, increase buffer.
    - Output JSON format ONLY.

    Input Data: ${JSON.stringify(aiInput)}

    Expected JSON Output Structure:
    {
      "recommendations": [
        { "code": "item_code", "qty": 10, "reason": "Short reason" }
      ]
    }
    `;

    // 4. 调用 OpenAI (修正版)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 推荐使用这个，又快又便宜
      messages: [
        { role: 'system', content: 'You are a helpful JSON API.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' }, // 强制 JSON 模式，关键！
    });

    // 5. 解析结果
    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content from AI');

    const parsed = JSON.parse(content);
    const recs = parsed.recommendations || [];

    // 6. 合并数据
    const merged = metrics.map((m) => {
      const r = recs.find((x: any) => x.code === m.code);
      return {
        ...m,
        recommendedQty: r?.qty ?? 0,
        reason: r?.reason ?? 'AI did not provide a reason.',
      };
    });

    return NextResponse.json({ items: merged });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    // 降级策略：如果 AI 挂了，至少返回原始数据，不让前端白屏
    const metrics = await getProductMetrics();
    return NextResponse.json({ items: metrics, error: 'AI unavailable' });
  }
}
