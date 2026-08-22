'use server';

import { prisma } from '@/lib/prisma';

/**
 * Seed dữ liệu MẪU cho kho + công thức để demo luồng chốt ngày.
 * Giá vốn dùng số ước lượng (chưa phải giá thật của quán).
 * Chủ quán sau đó vào /dashboard/kho-hang chỉnh lại từng dòng.
 */

type IngSeed = {
  name: string;
  category: 'TRA' | 'DUONG' | 'SUA' | 'TOPPING' | 'TRAI_CAY' | 'SYRUP' | 'CACAO' | 'CA_PHE' | 'BANH' | 'PHU_LIEU' | 'BAO_BI' | 'KHAC';
  unit: string;
  stock: number;
  alertLevel: number;
  costPerUnit: number;
  packagingNote?: string;
};

const INGREDIENTS: IngSeed[] = [
  { name: 'Trà đen', category: 'TRA', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 400, packagingNote: '1kg = 400.000đ (giá mẫu)' },
  { name: 'Trà lài Wao', category: 'TRA', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 500 },
  { name: 'Trà Ô Long', category: 'TRA', unit: 'g', stock: 1500, alertLevel: 150, costPerUnit: 600 },
  { name: 'Trà nguyên lá', category: 'TRA', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 700 },
  { name: 'Bông cúc khô', category: 'TRA', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 800 },

  { name: 'Đường vàng', category: 'DUONG', unit: 'g', stock: 20000, alertLevel: 2000, costPerUnit: 25 },
  { name: 'Đường cát trắng', category: 'DUONG', unit: 'g', stock: 5000, alertLevel: 500, costPerUnit: 22 },

  { name: 'Sữa đặc Ông Thọ', category: 'SUA', unit: 'g', stock: 3800, alertLevel: 380, costPerUnit: 60, packagingNote: '1 lon 380g ~ 23.000đ' },
  { name: 'Sữa tươi', category: 'SUA', unit: 'ml', stock: 5000, alertLevel: 500, costPerUnit: 35 },
  { name: 'Bột sữa', category: 'SUA', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 150 },
  { name: 'Whipping cream', category: 'SUA', unit: 'ml', stock: 1000, alertLevel: 250, costPerUnit: 120 },

  { name: 'Trân châu đen (khô)', category: 'TOPPING', unit: 'g', stock: 5000, alertLevel: 500, costPerUnit: 100, packagingNote: '1kg khô nấu ra ~15-17 ly' },
  { name: 'Hạt đác (bịch)', category: 'TOPPING', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 80 },

  { name: 'Cà phê hạt', category: 'CA_PHE', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 400 },

  { name: 'Bột cacao', category: 'CACAO', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 300 },
  { name: 'Milo bột', category: 'CACAO', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 250 },

  { name: 'Syrup Cam', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200, packagingNote: '1 chai 750ml ~ 150.000đ' },
  { name: 'Syrup Đào', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200 },
  { name: 'Syrup Xí Muội', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200 },
  { name: 'Syrup Hazelnut', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 220 },
  { name: 'Syrup Caramel', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200 },
  { name: 'Syrup Vải (lychee)', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 220 },
  { name: 'Syrup Cookie', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 220 },
  { name: 'Syrup Xoài', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200 },
  { name: 'Syrup Ổi', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 200 },

  { name: 'Vải tươi (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 150 },
  { name: 'Chôm chôm (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 120 },
  { name: 'Cam sành', category: 'TRAI_CAY', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 40 },
  { name: 'Tắc', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 60 },

  { name: 'Ly nhựa M + nắp + ống hút', category: 'BAO_BI', unit: 'cái', stock: 500, alertLevel: 100, costPerUnit: 1800 },
  { name: 'Ly nhựa L + nắp + ống hút', category: 'BAO_BI', unit: 'cái', stock: 300, alertLevel: 80, costPerUnit: 2500 },
];

type BaseSeed = {
  name: string;
  yieldQty: number;
  yieldUnit: string;
  ingredients: Array<{ name: string; quantity: number }>;
  notes?: string;
};

const BASES: BaseSeed[] = [
  {
    name: 'Hồng trà nền',
    yieldQty: 4500,
    yieldUnit: 'ml',
    ingredients: [
      { name: 'Trà đen', quantity: 180 },
    ],
    notes: '180g trà + 5L nước → 4.5L trà',
  },
  {
    name: 'Trà lài nền',
    yieldQty: 4600,
    yieldUnit: 'ml',
    ingredients: [
      { name: 'Trà lài Wao', quantity: 120 },
    ],
    notes: '120g trà + 5L nước → 4.6L (mẫu, thực tế Wao 60 + Minh Thành 60)',
  },
  {
    name: 'Ô long nền',
    yieldQty: 4500,
    yieldUnit: 'ml',
    ingredients: [
      { name: 'Trà Ô Long', quantity: 160 },
    ],
  },
  {
    name: 'Trân châu đen',
    yieldQty: 16,
    yieldUnit: 'ly',
    ingredients: [
      { name: 'Trân châu đen (khô)', quantity: 1000 },
      { name: 'Đường vàng', quantity: 750 },
    ],
    notes: '1kg khô → 15-17 ly (dùng 16 làm trung bình)',
  },
];

type RecipeSeed = {
  name: string;
  category: string;
  priceRegular: number;
  priceLarge: number;
  items: Array<
    | { kind: 'ingredient'; name: string; quantity: number; note?: string }
    | { kind: 'base'; name: string; quantity: number; note?: string }
  >;
};

const RECIPES: RecipeSeed[] = [
  {
    name: 'Hồng trà (nguyên vị)',
    category: 'Trà thuần',
    priceRegular: 25000,
    priceLarge: 35000,
    items: [
      { kind: 'base', name: 'Hồng trà nền', quantity: 150 },
      { kind: 'ingredient', name: 'Đường vàng', quantity: 30 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Trà lài tắc tươi',
    category: 'Trà thuần',
    priceRegular: 28000,
    priceLarge: 38000,
    items: [
      { kind: 'base', name: 'Trà lài nền', quantity: 150 },
      { kind: 'ingredient', name: 'Đường vàng', quantity: 50 },
      { kind: 'ingredient', name: 'Tắc', quantity: 20 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Hồng trà sữa trân châu',
    category: 'Trà sữa',
    priceRegular: 35000,
    priceLarge: 45000,
    items: [
      { kind: 'base', name: 'Hồng trà nền', quantity: 125 },
      { kind: 'ingredient', name: 'Bột sữa', quantity: 25 },
      { kind: 'ingredient', name: 'Sữa đặc Ông Thọ', quantity: 25 },
      { kind: 'base', name: 'Trân châu đen', quantity: 1 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Trà sữa caramel',
    category: 'Trà sữa',
    priceRegular: 38000,
    priceLarge: 48000,
    items: [
      { kind: 'base', name: 'Hồng trà nền', quantity: 125 },
      { kind: 'ingredient', name: 'Bột sữa', quantity: 25 },
      { kind: 'ingredient', name: 'Sữa đặc Ông Thọ', quantity: 20 },
      { kind: 'ingredient', name: 'Syrup Caramel', quantity: 10 },
      { kind: 'base', name: 'Trân châu đen', quantity: 1 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Ô long đào',
    category: 'Trà trái cây',
    priceRegular: 32000,
    priceLarge: 42000,
    items: [
      { kind: 'base', name: 'Ô long nền', quantity: 125 },
      { kind: 'ingredient', name: 'Đường vàng', quantity: 25 },
      { kind: 'ingredient', name: 'Syrup Đào', quantity: 20 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Cà phê sữa',
    category: 'Cà phê',
    priceRegular: 22000,
    priceLarge: 30000,
    items: [
      { kind: 'ingredient', name: 'Cà phê hạt', quantity: 18 },
      { kind: 'ingredient', name: 'Sữa đặc Ông Thọ', quantity: 30 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Bạc xỉu',
    category: 'Cà phê',
    priceRegular: 25000,
    priceLarge: 33000,
    items: [
      { kind: 'ingredient', name: 'Cà phê hạt', quantity: 9 },
      { kind: 'ingredient', name: 'Sữa đặc Ông Thọ', quantity: 40 },
      { kind: 'ingredient', name: 'Sữa tươi', quantity: 40 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
  {
    name: 'Trà sữa vải phô mai',
    category: 'Trà sữa',
    priceRegular: 42000,
    priceLarge: 52000,
    items: [
      { kind: 'base', name: 'Hồng trà nền', quantity: 125 },
      { kind: 'ingredient', name: 'Bột sữa', quantity: 25 },
      { kind: 'ingredient', name: 'Sữa đặc Ông Thọ', quantity: 10 },
      { kind: 'ingredient', name: 'Syrup Vải (lychee)', quantity: 10 },
      { kind: 'ingredient', name: 'Vải tươi (cùi)', quantity: 30 },
      { kind: 'ingredient', name: 'Ly nhựa M + nắp + ống hút', quantity: 1 },
    ],
  },
];

export type SeedResult = { ok: boolean; message: string };

export async function seedInventorySample(): Promise<SeedResult> {
  try {
    // Ingredients
    const ingMap = new Map<string, string>();
    for (const ing of INGREDIENTS) {
      const rec = await prisma.ingredient.upsert({
        where: { name: ing.name },
        create: ing,
        update: {}, // giữ nguyên nếu đã tồn tại (không đè stock/giá của user)
      });
      ingMap.set(ing.name, rec.id);
    }

    // Base preps
    const baseMap = new Map<string, string>();
    for (const b of BASES) {
      const existing = await prisma.basePrep.findUnique({ where: { name: b.name } });
      if (existing) {
        baseMap.set(b.name, existing.id);
        continue;
      }
      const created = await prisma.basePrep.create({
        data: {
          name: b.name,
          yieldQty: b.yieldQty,
          yieldUnit: b.yieldUnit,
          notes: b.notes ?? null,
          ingredients: {
            create: b.ingredients.map((i) => ({
              ingredientId: ingMap.get(i.name)!,
              quantity: i.quantity,
            })),
          },
        },
      });
      baseMap.set(b.name, created.id);
    }

    // Recipes
    let recipeCount = 0;
    for (const r of RECIPES) {
      const existing = await prisma.drinkRecipe.findUnique({ where: { name: r.name } });
      if (existing) continue;
      await prisma.drinkRecipe.create({
        data: {
          name: r.name,
          category: r.category,
          priceRegular: r.priceRegular,
          priceLarge: r.priceLarge,
          items: {
            create: r.items.map((it) =>
              it.kind === 'ingredient'
                ? {
                    ingredientId: ingMap.get(it.name)!,
                    quantity: it.quantity,
                    note: it.note ?? null,
                  }
                : {
                    basePrepId: baseMap.get(it.name)!,
                    quantity: it.quantity,
                    note: it.note ?? null,
                  }
            ),
          },
        },
      });
      recipeCount++;
    }

    return {
      ok: true,
      message: `Đã seed ${INGREDIENTS.length} nguyên liệu, ${BASES.length} nền, ${recipeCount} món mới. Vào /dashboard/kho-hang để chỉnh giá vốn/tồn kho thật.`,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}
