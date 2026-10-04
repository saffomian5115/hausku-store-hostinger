/**
 * Inspect test order state + stock. Run from project root:
 *   node --env-file=.env scripts/check-order.mjs <orderId|latest>
 */
import pkg from "@prisma/client";
const PrismaClient = pkg.PrismaClient ?? pkg.default?.PrismaClient;
const prisma = new PrismaClient();

const arg = process.argv[2];
const out = {};

if (arg && arg !== "latest") {
  const id = parseInt(arg, 10);
  out.order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
} else {
  out.recentOrders = await prisma.order.findMany({
    orderBy: { id: "desc" },
    take: 5,
    select: {
      id: true, orderNumber: true, status: true, total: true,
      paymentId: true, paidAt: true, guestEmail: true, createdAt: true,
    },
  });
}

out.variant6_stock = await prisma.productVariant.findUnique({
  where: { id: 6 },
  select: { id: true, stockQty: true },
});

console.log(JSON.stringify(out, null, 2));
await prisma.$disconnect();
