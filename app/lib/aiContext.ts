import type { AbstractPowerSyncDatabase } from '@powersync/common';

import type { UserProfile } from './user';
import type { MealRow } from './meals';
import { localIsoDate } from './meals';
import type { RecipeRow } from './recipes';
import { mapUserRow } from '../hooks/useUserProfile';
import { mapMealRow, MEAL_SELECT } from '../hooks/useMealsForDate';
import { mapRecipeRow } from '../hooks/useRecipes';

function mealCalories(meal: MealRow): number {
  return meal.calories ?? meal.nutritions?.calories ?? 0;
}

function recipeCalories(recipe: RecipeRow): number {
  return recipe.calories ?? recipe.nutritions?.calories ?? 0;
}

const HISTORY_WINDOW_DAYS = 30;

export { HISTORY_WINDOW_DAYS };

/**
 * Native-only: reads profile/recipes/meal history straight from local
 * PowerSync storage (fresh at call time, not a cached hook value) instead of
 * round-tripping to the server. Only meaningful where PowerSync actually
 * syncs — do not call this on web, where `db` is an inert placeholder.
 */
export async function fetchLocalUserContext(
  db: AbstractPowerSyncDatabase,
  userId: string | null | undefined
): Promise<string> {
  if (!userId) return '';

  const profileRow = await db.getOptional<any>('SELECT * FROM "user" WHERE id = ?', [userId]);
  if (!profileRow) return '';

  const recipeRows = await db.getAll<any>(
    'SELECT * FROM recipes WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
    [userId]
  );

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_WINDOW_DAYS);
  const mealRows = await db.getAll<any>(
    `${MEAL_SELECT} WHERE meal.user_id = ? AND meal.meal_date >= ? ORDER BY meal.meal_date DESC, meal.created_at`,
    [userId, localIsoDate(cutoff)]
  );

  return buildUserContext(
    mapUserRow(profileRow),
    mealRows.map(mapMealRow),
    recipeRows.map(mapRecipeRow)
  );
}

/**
 * Pure formatter — takes already-fetched profile/meal/recipe rows (from
 * wherever: server-side Drizzle query, local PowerSync read, etc.) and
 * turns them into the plain-text block sent to Gemini as chat context.
 */
export function buildUserContext(
  profile: UserProfile | null,
  meals: MealRow[],
  recipes: RecipeRow[]
): string {
  if (!profile) return '';

  const lines: string[] = [];
  lines.push(`Name: ${profile.name}`);
  if (profile.dietGoal) lines.push(`Diet goal: ${profile.dietGoal}`);
  if (profile.dailyCalorieTarget) {
    lines.push(`Daily calorie target: ${profile.dailyCalorieTarget} kcal`);
  }
  lines.push(`Preferred units: ${profile.units === 'imperial' ? 'imperial (lb, oz)' : 'metric (kg, g)'}`);

  if (recipes.length === 0) {
    lines.push('Saved recipes: none yet.');
  } else {
    lines.push(`Saved recipes (${recipes.length}):`);
    for (const recipe of recipes) {
      lines.push(`  - ${recipe.title} (${recipe.category ?? 'uncategorized'}): ${recipeCalories(recipe)} kcal`);
    }
  }

  if (meals.length === 0) {
    lines.push(`Meal history: nothing logged in the last ${HISTORY_WINDOW_DAYS} days.`);
    return lines.join('\n');
  }

  const byDate = new Map<string, MealRow[]>();
  for (const meal of meals) {
    const dayMeals = byDate.get(meal.mealDate) ?? [];
    dayMeals.push(meal);
    byDate.set(meal.mealDate, dayMeals);
  }

  const datesDescending = [...byDate.keys()].sort().reverse();

  lines.push(`Meal history, last ${HISTORY_WINDOW_DAYS} days (most recent first):`);
  for (const date of datesDescending) {
    const dayMeals = byDate.get(date)!;
    const logged = dayMeals.filter((meal) => meal.completed);
    const totalCalories = logged.reduce((sum, meal) => sum + mealCalories(meal), 0);
    const totalProtein = logged.reduce((sum, meal) => sum + (meal.nutritions?.protein ?? 0), 0);
    const totalFat = logged.reduce((sum, meal) => sum + (meal.nutritions?.fat ?? 0), 0);
    const totalCarbs = logged.reduce((sum, meal) => sum + (meal.nutritions?.carbs ?? 0), 0);

    lines.push(
      `${date}: ${totalCalories} kcal total (${totalProtein}g protein, ${totalFat}g fat, ${totalCarbs}g carbs)`
    );
    for (const meal of dayMeals) {
      const status = meal.completed ? '' : ' (planned, not logged)';
      lines.push(`  - ${meal.title} (${meal.category ?? 'meal'}): ${mealCalories(meal)} kcal${status}`);
    }
  }

  return lines.join('\n');
}
