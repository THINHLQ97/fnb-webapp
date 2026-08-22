'use client';

import { useState } from 'react';
import { IngredientsTab } from './ingredients-tab';
import { RecipesTab } from './recipes-tab';
import { SalesTab } from './sales-tab';
import { ReportsTab } from './reports-tab';
import type { RecipeWithItems } from '../api/types';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  alertLevel: number;
  costPerUnit: number;
  packagingNote: string | null;
};

type Close = {
  id: string;
  date: Date;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  itemsSold: number;
};

type Recipe = {
  id: string;
  name: string;
  category: string | null;
  priceRegular: number;
  priceLarge: number;
};

type Tab = 'ingredients' | 'recipes' | 'sales' | 'reports';

export function InventoryPage({
  ingredients,
  recipes,
  simpleRecipes,
  closes,
}: {
  ingredients: Ingredient[];
  recipes: RecipeWithItems[];
  simpleRecipes: Recipe[];
  closes: Close[];
}) {
  const [tab, setTab] = useState<Tab>('sales');

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'sales', label: 'Bán trong ngày' },
    { id: 'ingredients', label: 'Nguyên liệu', count: ingredients.length },
    { id: 'recipes', label: 'Công thức', count: recipes.length },
    { id: 'reports', label: 'Báo cáo', count: closes.length },
  ];

  const alertCount = ingredients.filter((i) => i.stock <= i.alertLevel && i.alertLevel > 0).length;

  return (
    <div className='space-y-4'>
      {alertCount > 0 && (
        <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900'>
          ⚠️ <strong>{alertCount}</strong> nguyên liệu dưới ngưỡng cảnh báo. Xem tab{' '}
          <button className='underline font-medium' onClick={() => setTab('ingredients')}>
            Nguyên liệu
          </button>
          .
        </div>
      )}

      <div className='flex gap-1 border-b'>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className='ml-1.5 text-xs text-muted-foreground'>({t.count})</span>
            )}
          </button>
        ))}
      </div>

      <div>
        {tab === 'sales' && <SalesTab recipes={simpleRecipes} />}
        {tab === 'ingredients' && <IngredientsTab initial={ingredients} />}
        {tab === 'recipes' && <RecipesTab recipes={recipes} />}
        {tab === 'reports' && <ReportsTab closes={closes} />}
      </div>
    </div>
  );
}
