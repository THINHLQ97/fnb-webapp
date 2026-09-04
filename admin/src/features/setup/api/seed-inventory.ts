'use server';

import { prisma } from '@/lib/prisma';

/**
 * Seed dữ liệu KHO + công thức. Giá vốn lấy từ HĐ thật (WAO, Mokafi,
 * Thanh Bạch, Phương Linh) — ô nào không có HĐ thì ước theo thị trường
 * VN 2026, xem file `Công thức Hí Hế - CẦN ĐIỀN v3-FULL-by-claude.xlsx`
 * để đối chiếu và chỉnh giá vốn thật.
 *
 * Re-run an toàn: upsert giữ nguyên stock/alertLevel của bạn, chỉ cập
 * nhật costPerUnit + packagingNote.
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
  // TRÀ (HĐ WAO 20/07/2026)
  { name: 'Trà đen', category: 'TRA', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 235.44, packagingNote: 'WAO Hồng Trà Thượng Hạng — 235.440đ/kg' },
  { name: 'Trà lài Wao', category: 'TRA', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 207.36, packagingNote: 'WAO Trà Xanh Lài — 207.360đ/kg' },
  { name: 'Trà Ô Long', category: 'TRA', unit: 'g', stock: 1500, alertLevel: 150, costPerUnit: 301.32, packagingNote: 'WAO Olong Rạng — 301.320đ/kg' },
  { name: 'Trà nguyên lá', category: 'TRA', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 196.56, packagingNote: 'WAO Trà Đen Nguyên Lá — 196.560đ/kg' },
  { name: 'Bông cúc khô', category: 'TRA', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 250, packagingNote: '250.000đ/kg' },
  { name: 'Trà lài Minh Thành', category: 'TRA', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 1000, packagingNote: 'ƯỚC 1 bao "bự" 500g × 500.000đ (nếu bao 1kg → 500đ/g)' },
  { name: 'Trà thơm', category: 'TRA', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 220, packagingNote: 'ƯỚC 220.000đ/kg (làm trà lài kèm Wao)' },

  // ĐƯỜNG
  { name: 'Đường vàng', category: 'DUONG', unit: 'g', stock: 20000, alertLevel: 2000, costPerUnit: 22.20, packagingNote: 'Đường mía Thanh Bạch — 1.110.000đ/bao 50kg' },
  { name: 'Đường cát trắng', category: 'DUONG', unit: 'g', stock: 5000, alertLevel: 500, costPerUnit: 19.17, packagingNote: '230.000đ/cây 12kg' },

  // SỮA (Ngôi Sao thay Ông Thọ theo user)
  { name: 'Sữa đặc Ông Thọ', category: 'SUA', unit: 'g', stock: 3800, alertLevel: 380, costPerUnit: 41.39, packagingNote: 'Ngôi Sao — 755.000đ/thùng, ƯỚC 48 lon 380g' },
  { name: 'Sữa tươi', category: 'SUA', unit: 'ml', stock: 5000, alertLevel: 500, costPerUnit: 29.17, packagingNote: 'Happy Barn Tím — 350.000đ/thùng 12 hộp 1L' },
  { name: 'Bột sữa', category: 'SUA', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 83.60, packagingNote: 'Frima — 2.090.000đ/bao 25kg' },
  { name: 'Whipping cream', category: 'SUA', unit: 'ml', stock: 1000, alertLevel: 250, costPerUnit: 148, packagingNote: 'Anchor — 148.000đ/hộp 1L' },

  // TOPPING
  { name: 'Trân châu đen (khô)', category: 'TOPPING', unit: 'g', stock: 5000, alertLevel: 500, costPerUnit: 30.33, packagingNote: 'DOU XIAN — 546.000đ/thùng 18kg (6 gói 3kg). 1kg khô ~15 ly' },
  { name: 'Hạt đác (bịch)', category: 'TOPPING', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 70, packagingNote: 'ƯỚC 70.000đ/bịch 1kg' },
  { name: 'Sương sáo (bột)', category: 'TOPPING', unit: 'bịch', stock: 20, alertLevel: 5, costPerUnit: 20000, packagingNote: 'ƯỚC bịch 40g ~ 20.000đ. Thạch bông cúc 1 bịch/mẻ' },
  { name: 'Nước cốt vải (topping)', category: 'TOPPING', unit: 'ml', stock: 565, alertLevel: 100, costPerUnit: 116.81, packagingNote: 'Vải Thiều Tem Đỏ 396k/thùng 12 lon (ước lon 565ml)' },

  // CÀ PHÊ + CACAO
  { name: 'Cà phê hạt', category: 'CA_PHE', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 230, packagingNote: 'Mokafi Silver — 230.000đ/kg' },

  { name: 'Bột cacao', category: 'CACAO', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 240, packagingNote: '2.400.000đ/bao 10kg' },
  { name: 'Milo bột', category: 'CACAO', unit: 'g', stock: 500, alertLevel: 50, costPerUnit: 200, packagingNote: 'ƯỚC 200.000đ/kg' },

  // SYRUP
  { name: 'Syrup Cam', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 142.67, packagingNote: 'Sun Up — 107.000đ/chai 750ml' },
  { name: 'Syrup Đào', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 98, packagingNote: 'Osterberg Sinh Tố — 98.000đ/chai 1L' },
  { name: 'Syrup Xí Muội', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 100, packagingNote: 'ƯỚC tự ngâm — 100đ/ml' },
  { name: 'Syrup Hazelnut', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 253.33, packagingNote: 'ƯỚC Davinci — 190.000đ/chai 750ml' },
  { name: 'Syrup Caramel', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 245.33, packagingNote: 'Davinci — 184.000đ/chai 750ml' },
  { name: 'Syrup Vải (lychee)', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 186.67, packagingNote: 'ƯỚC 140.000đ/chai 750ml' },
  { name: 'Syrup Cookie', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 245.33, packagingNote: 'Davinci — 184.000đ/chai 750ml' },
  { name: 'Syrup Xoài', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 142.67, packagingNote: 'Sun Up — 107.000đ/chai 750ml' },
  { name: 'Syrup Ổi', category: 'SYRUP', unit: 'ml', stock: 750, alertLevel: 100, costPerUnit: 173.33, packagingNote: 'ƯỚC 130.000đ/chai 750ml' },

  // TRÁI CÂY (giá tính trên phần ăn được, đã trừ yield)
  { name: 'Vải tươi (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 91, packagingNote: 'ƯỚC 50k/kg, yield 55% (bỏ vỏ hạt)' },
  { name: 'Chôm chôm (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 73, packagingNote: 'ƯỚC 40k/kg, yield 55%' },
  { name: 'Xoài (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 77, packagingNote: 'ƯỚC xoài Cát Hoà Lộc 50k/kg, yield 65%' },
  { name: 'Ổi hồng', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 35, packagingNote: 'ƯỚC 30.000đ/kg, yield 85%' },
  { name: 'Cam sành', category: 'TRAI_CAY', unit: 'g', stock: 3000, alertLevel: 300, costPerUnit: 30, packagingNote: 'ƯỚC 30.000đ/kg' },
  { name: 'Quýt (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 83, packagingNote: 'ƯỚC 50k/kg, yield 60% (tách múi)' },
  { name: 'Nhãn (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 91, packagingNote: 'ƯỚC 50k/kg, yield 55%' },
  { name: 'Măng cầu (cùi)', category: 'TRAI_CAY', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 175, packagingNote: 'ƯỚC 70k/kg, yield 40% (bỏ vỏ hạt)' },
  { name: 'Tắc', category: 'TRAI_CAY', unit: 'g', stock: 2000, alertLevel: 200, costPerUnit: 30, packagingNote: 'ƯỚC 30.000đ/kg' },
  { name: 'Thơm (dứa)', category: 'TRAI_CAY', unit: 'trái', stock: 5, alertLevel: 2, costPerUnit: 25000, packagingNote: 'ƯỚC 25.000đ/trái vừa. Đác thơm 2 trái/mẻ' },

  // BÁNH (đơn vị tính theo bánh/hũ)
  { name: 'Bánh Cream O', category: 'BANH', unit: 'bánh', stock: 100, alertLevel: 20, costPerUnit: 700, packagingNote: 'ƯỚC 700đ/bánh mini. Đá xay Cookie 3 bánh/ly' },
  { name: 'Bánh Oreo', category: 'BANH', unit: 'bánh', stock: 100, alertLevel: 20, costPerUnit: 1000, packagingNote: 'ƯỚC 1.000đ/bánh mini. Milo dầm 1 bánh/ly' },
  { name: 'Bánh Flan', category: 'BANH', unit: 'hũ', stock: 20, alertLevel: 5, costPerUnit: 4000, packagingNote: 'ƯỚC tự làm 4.000đ/hũ 90g (mua sẵn ~8-10k)' },

  // PHỤ LIỆU
  { name: 'Gelatin', category: 'PHU_LIEU', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 280, packagingNote: 'Ewald — 280.000đ/gói 1kg' },
  { name: 'Muối', category: 'PHU_LIEU', unit: 'g', stock: 1000, alertLevel: 100, costPerUnit: 10, packagingNote: 'ƯỚC 10.000đ/kg' },
  { name: 'Vani ống', category: 'PHU_LIEU', unit: 'ống', stock: 50, alertLevel: 10, costPerUnit: 2500, packagingNote: 'ƯỚC 2.500đ/ống (lốc 10 ống ~25k). Flan 2 ống/mẻ' },
  { name: 'Trứng gà', category: 'PHU_LIEU', unit: 'quả', stock: 30, alertLevel: 10, costPerUnit: 3500, packagingNote: 'ƯỚC 3.500đ/quả công nghiệp. Flan 10 quả/mẻ' },
  { name: 'Màu thực phẩm', category: 'PHU_LIEU', unit: 'giọt', stock: 600, alertLevel: 100, costPerUnit: 50, packagingNote: 'ƯỚC chai 30ml ~30k, ~20 giọt/ml → 50đ/giọt' },

  // BAO BÌ
  { name: 'Ly nhựa M + nắp + ống hút', category: 'BAO_BI', unit: 'cái', stock: 500, alertLevel: 100, costPerUnit: 1820, packagingNote: 'Ly M 1.320đ + nắp 300đ + ống to 200đ' },
  { name: 'Ly nhựa L + nắp + ống hút', category: 'BAO_BI', unit: 'cái', stock: 300, alertLevel: 80, costPerUnit: 2150, packagingNote: 'Ly L 1.600đ + nắp 350đ + ống to 200đ (ƯỚC)' },
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
    // Ingredients — chỉ cập nhật costPerUnit + packagingNote khi re-run,
    // GIỮ NGUYÊN stock và alertLevel của user
    const ingMap = new Map<string, string>();
    for (const ing of INGREDIENTS) {
      const rec = await prisma.ingredient.upsert({
        where: { name: ing.name },
        create: ing,
        update: {
          costPerUnit: ing.costPerUnit,
          packagingNote: ing.packagingNote ?? null,
          category: ing.category,
          unit: ing.unit,
        },
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
