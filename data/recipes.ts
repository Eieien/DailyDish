import type { Recipe } from '@/app/types/recipe';

/**
 * Temporary in-memory recipe catalog.
 *
 * This stands in for the API/DB layer while the recipe details screen is being
 * built out. Swap `getRecipeById` for a real fetch (Expo Router API route +
 * Drizzle) once the backend is ready — the screen only depends on this helper.
 */
export const RECIPES: Record<string, Recipe> = {
  'pinoy-breakfast': {
    id: 'pinoy-breakfast',
    title: 'Pinoy Breakfast',
    image:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80',
    nutrition: { calories: 400, protein: 18, fat: 16, carbs: 42 },
    ingredients: [
      'Egg (fried)',
      'Salt & Pepper',
      'Longganisa',
      'Garlic',
      'Cooked Rice',
      'Cooking Oil',
    ],
    steps: [
      'Heat oil in a pan over medium heat. Fry the longganisa until cooked, about 5 minutes.',
      'In the same pan, fry the egg to your preference (sunny side up or over easy).',
      'In another pan, heat oil and stir-fry the cooked rice with minced garlic, salt, and pepper for 3-4 minutes.',
      'Plate the fried rice, arrange the longganisa and fried egg on top. Serve hot with fresh cucumber slices.',
    ],
  },
};

/** The recipe used when a route is opened without a matching id. */
export const DEFAULT_RECIPE_ID = 'pinoy-breakfast';

export function getRecipeById(id?: string): Recipe {
  if (id && RECIPES[id]) {
    return RECIPES[id];
  }
  return RECIPES[DEFAULT_RECIPE_ID];
}
