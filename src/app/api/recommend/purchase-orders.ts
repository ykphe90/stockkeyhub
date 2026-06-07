// app/api/recommend/purchase-orders.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body; // 接收一个数组: [{ productId: 1, quantity: 10 }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // 使用 Transaction 保证原子性：要么全成功，要么全失败
    const result = await prisma.$transaction(
      items.map((item) =>
        prisma.purchaseOrder.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            status: 'DRAFT', // 确保你的 schema 里的 enum 和这里匹配
          },
        })
      )
    );

    return NextResponse.json({ count: result.length, orders: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Batch create failed' }, { status: 500 });
  }
}