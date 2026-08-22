import type { listRecipes } from './service';

export type RecipeWithItems = Awaited<ReturnType<typeof listRecipes>>[number];
