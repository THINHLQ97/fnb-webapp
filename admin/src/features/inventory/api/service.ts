'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function isInventoryReady(): Promise<boolean> {
  try {
    await prisma.ingredient.count();
    return true;
  } catch {
    return false;
  }
}

// ============== INGREDIENTS ==============

export async function listIngredients() {
  return prisma.ingredient.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function updateIngredient(id: string, data: {
  stock?: number;
  costPerUnit?: number;
  alertLevel?: number;
  packagingNote?: string | null;
}) {
  return prisma.ingredient.update({ where: { id }, data });
}

export async function addStock(ingredientId: string, qty: number, cost: number, note?: string) {
  return prisma.$transaction(async (tx) => {
    await tx.ingredient.update({
      where: { id: ingredientId },
      data: { stock: { increment: qty } },
    });
    await tx.stockMovement.create({
      data: {
        ingredientId,
        delta: qty,
        reason: 'PURCHASE',
        refDate: new Date(),
        cost,
        note: note ?? null,
      },
    });
  });
}

// ============== RECIPES ==============

export async function listRecipes() {
  return prisma.drinkRecipe.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    include: {
      items: {
        include: {
          ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true } },
          basePrep: {
            select: {
              id: true,
              name: true,
              yieldQty: true,
              yieldUnit: true,
              ingredients: {
                include: {
                  ingredient: { select: { name: true, unit: true, costPerUnit: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}

// Type-only export helper: caller cần type này thì import từ ./types
// (không thể export type trong file 'use server')

// ============== DAILY SALES ==============

function toDateOnly(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDailySales(date: Date) {
  const d = toDateOnly(date);
  return prisma.dailySale.findMany({
    where: { date: d },
    include: { recipe: { select: { name: true, category: true, priceRegular: true, priceLarge: true } } },
  });
}

export async function upsertDailySale(
  date: Date,
  recipeId: string,
  data: { countRegular: number; countLarge: number; countPromo: number }
) {
  const d = toDateOnly(date);
  return prisma.dailySale.upsert({
    where: { date_recipeId: { date: d, recipeId } },
    create: { date: d, recipeId, ...data },
    update: data,
  });
}

// ============== CLOSE DAY ==============

export async function isDayClosed(date: Date): Promise<boolean> {
  const d = toDateOnly(date);
  const row = await prisma.dailyClose.findUnique({ where: { date: d } });
  return !!row;
}

export async function closeDay(date: Date): Promise<{
  ok: boolean;
  message: string;
  totalRevenue?: number;
  totalCost?: number;
  netProfit?: number;
  itemsSold?: number;
}> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: 'Chưa đăng nhập' };

  const d = toDateOnly(date);

  const existing = await prisma.dailyClose.findUnique({ where: { date: d } });
  if (existing) {
    return {
      ok: false,
      message: `Ngày ${d.toISOString().slice(0, 10)} đã chốt sổ trước đó. Không thể chốt lại.`,
    };
  }

  const sales = await prisma.dailySale.findMany({
    where: { date: d },
    include: {
      recipe: {
        include: {
          items: {
            include: {
              ingredient: true,
              basePrep: {
                include: { ingredients: { include: { ingredient: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (sales.length === 0) {
    return { ok: false, message: 'Ngày này chưa nhập món bán nào. Vào tab "Bán trong ngày" để nhập.' };
  }

  // Tính consumption
  const consumption = new Map<string, number>(); // ingredientId -> total qty consumed
  let totalRevenue = 0;
  let totalCost = 0;
  let itemsSold = 0;

  for (const sale of sales) {
    const totalCups = sale.countRegular + sale.countLarge + sale.countPromo;
    itemsSold += totalCups;
    const revenue =
      sale.countRegular * sale.recipe.priceRegular + sale.countLarge * sale.recipe.priceLarge;
    totalRevenue += revenue;

    const factor = sale.recipe.sizeLargeFactor;

    for (const item of sale.recipe.items) {
      // Số lượng cần cho tất cả ly bán:
      // countRegular × qty + countLarge × qty × factor + countPromo × qty
      const qtyRegularPortion = sale.countRegular * item.quantity;
      const qtyLargePortion = sale.countLarge * item.quantity * factor;
      const qtyPromoPortion = sale.countPromo * item.quantity;
      const totalQty = qtyRegularPortion + qtyLargePortion + qtyPromoPortion;
      if (totalQty <= 0) continue;

      if (item.ingredient) {
        const prev = consumption.get(item.ingredient.id) ?? 0;
        consumption.set(item.ingredient.id, prev + totalQty);
        totalCost += totalQty * item.ingredient.costPerUnit;
      } else if (item.basePrep) {
        // Trừ từng ingredient của base theo tỷ lệ
        const baseYield = item.basePrep.yieldQty;
        for (const bi of item.basePrep.ingredients) {
          const perUnit = bi.quantity / baseYield; // qty ingredient / đơn vị yield
          const ingConsumed = totalQty * perUnit;
          const prev = consumption.get(bi.ingredient.id) ?? 0;
          consumption.set(bi.ingredient.id, prev + ingConsumed);
          totalCost += ingConsumed * bi.ingredient.costPerUnit;
        }
      }
    }
  }

  const netProfit = totalRevenue - totalCost;

  // Apply: trừ stock + log movement + tạo DailyClose (atomic)
  await prisma.$transaction(async (tx) => {
    for (const [ingId, qty] of consumption.entries()) {
      await tx.ingredient.update({
        where: { id: ingId },
        data: { stock: { decrement: qty } },
      });
      await tx.stockMovement.create({
        data: {
          ingredientId: ingId,
          delta: -qty,
          reason: 'CONSUME',
          refDate: d,
          cost: 0,
          note: `Chốt ngày ${d.toISOString().slice(0, 10)}`,
        },
      });
    }
    await tx.dailyClose.create({
      data: {
        date: d,
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        netProfit: Math.round(netProfit),
        itemsSold,
        closedBy: userId,
      },
    });
  });

  return {
    ok: true,
    message: `Đã chốt ngày ${d.toISOString().slice(0, 10)}. Xem báo cáo bên dưới.`,
    totalRevenue: Math.round(totalRevenue),
    totalCost: Math.round(totalCost),
    netProfit: Math.round(netProfit),
    itemsSold,
  };
}

export async function listDailyCloses(limit = 30) {
  return prisma.dailyClose.findMany({
    orderBy: { date: 'desc' },
    take: limit,
  });
}
