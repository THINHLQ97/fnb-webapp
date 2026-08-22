// Utility functions (không phải server action) — dùng client-side để tính cost.

export type RecipeItemLite = {
  quantity: number;
  ingredient?: { costPerUnit: number } | null;
  basePrep?: {
    yieldQty: number;
    ingredients: Array<{
      quantity: number;
      ingredient: { costPerUnit: number };
    }>;
  } | null;
};

export type RecipeLite = {
  items: RecipeItemLite[];
};

/** Cost/ly size M dựa trên nguyên liệu × giá vốn. */
export function computeRecipeCostM(recipe: RecipeLite): number {
  let cost = 0;
  for (const item of recipe.items) {
    if (item.ingredient) {
      cost += item.quantity * item.ingredient.costPerUnit;
    } else if (item.basePrep) {
      let baseTotalCost = 0;
      for (const bi of item.basePrep.ingredients) {
        baseTotalCost += bi.quantity * bi.ingredient.costPerUnit;
      }
      const costPerYieldUnit = baseTotalCost / item.basePrep.yieldQty;
      cost += item.quantity * costPerYieldUnit;
    }
  }
  return Math.round(cost);
}
