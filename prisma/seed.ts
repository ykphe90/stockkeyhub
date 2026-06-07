import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // 1. 获取所有现有商品
  const products = await prisma.product.findMany()

  if (products.length === 0) {
    console.log('❌ No products found. Please add products first.')
    return
  }

  // 2. 为每个商品生成随机销售记录
  for (const product of products) {
    // 随机决定这个商品是否畅销 (70% 几率有销量)
    if (Math.random() > 0.3) {
      // 生成 5 到 20 笔销售记录
      const numberOfSales = Math.floor(Math.random() * 15) + 5
      
      console.log(`Creating ${numberOfSales} sales for ${product.name}...`)

      for (let i = 0; i < numberOfSales; i++) {
        // 随机日期：过去 0 到 10 天内
        const daysAgo = Math.floor(Math.random() * 10)
        const soldAt = new Date()
        soldAt.setDate(soldAt.getDate() - daysAgo)

        // 随机数量：1 到 10 个
        const quantity = Math.floor(Math.random() * 10) + 1

        await prisma.sale.create({
          data: {
            productId: product.id,
            quantity: quantity,
            soldAt: soldAt,
          },
        })
      }
    }
  }

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })