// app/api/recommend/purchase-orders.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body; // receive an array: [{ productId: 1, quantity: 10 }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // use transaction for atomicity: all succeed or all fail
    const result = await prisma.$transaction(
      items.map((item) =>
        prisma.purchaseOrder.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            status: 'DRAFT', // ensure the enum in your schema matches this value
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