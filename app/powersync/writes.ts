import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

import { powersync } from './PowerSyncProvider';
import type { CreateMealInput, UpdateMealInput } from '../lib/meals';
import { createMeal, deleteMeal, localIsoDate, updateMeal } from '../lib/meals';
import type { CreateRecipeInput, UpdateRecipeInput } from '../lib/recipes';
import { createRecipe, deleteRecipe, updateRecipe } from '../lib/recipes';
import type { UserProfile } from '../lib/user';
import { updateUser } from '../lib/user';
import { notifyDataChanged } from '../lib/dataRefresh';

// PowerSync's web sync has never reliably connected (see PowerSyncProvider),
// so on web every write here falls back to the same REST calls these screens
// used before PowerSync existed. Native keeps the local-first PowerSync path.
const IS_WEB = Platform.OS === 'web';

function buildUpdate(table: string, sets: string[], params: any[], id: string) {
  sets.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);
  return powersync.execute(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, params);
}

export async function insertMealLocal(input: Omit<CreateMealInput, 'id'>): Promise<string> {
  if (IS_WEB) {
    const row = await createMeal(input);
    notifyDataChanged();
    return row.id;
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await powersync.execute(
    `INSERT INTO meal
      (id, user_id, recipe_id, title, category, calories, image_url, completed, meal_date, nutritions, ingredients, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.recipeId ?? null,
      input.title,
      input.category ?? null,
      input.calories ?? null,
      input.imageUrl ?? null,
      input.completed ? 1 : 0,
      input.mealDate ?? localIsoDate(),
      input.nutritions ? JSON.stringify(input.nutritions) : null,
      input.ingredients ? JSON.stringify(input.ingredients) : null,
      now,
      now,
    ]
  );

  return id;
}

export async function updateMealLocal(id: string, patch: UpdateMealInput): Promise<void> {
  if (IS_WEB) {
    await updateMeal(id, patch);
    notifyDataChanged();
    return;
  }

  const sets: string[] = [];
  const params: any[] = [];
  const push = (col: string, value: any) => {
    sets.push(`${col} = ?`);
    params.push(value);
  };

  if (patch.title !== undefined) push('title', patch.title);
  if (patch.category !== undefined) push('category', patch.category);
  if (patch.calories !== undefined) push('calories', patch.calories);
  if (patch.imageUrl !== undefined) push('image_url', patch.imageUrl);
  if (patch.completed !== undefined) push('completed', patch.completed ? 1 : 0);
  if (patch.nutritions !== undefined) {
    push('nutritions', patch.nutritions ? JSON.stringify(patch.nutritions) : null);
  }
  if (patch.ingredients !== undefined) {
    push('ingredients', patch.ingredients ? JSON.stringify(patch.ingredients) : null);
  }

  if (sets.length === 0) return;
  await buildUpdate('meal', sets, params, id);
}

export function setMealCompletedLocal(id: string, completed: boolean): Promise<void> {
  return updateMealLocal(id, { completed });
}

export async function deleteMealLocal(id: string): Promise<void> {
  if (IS_WEB) {
    await deleteMeal(id);
    notifyDataChanged();
    return;
  }
  await powersync.execute('DELETE FROM meal WHERE id = ?', [id]);
}

export async function insertRecipeLocal(input: Omit<CreateRecipeInput, 'id'>): Promise<string> {
  if (IS_WEB) {
    const row = await createRecipe(input);
    notifyDataChanged();
    return row.id;
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await powersync.execute(
    `INSERT INTO recipes
      (id, user_id, title, category, description, image, calories, ingredients, nutritions, steps, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.title,
      input.category ?? null,
      input.description ?? null,
      input.image ?? null,
      input.calories ?? null,
      input.ingredients ? JSON.stringify(input.ingredients) : null,
      input.nutritions ? JSON.stringify(input.nutritions) : null,
      input.steps ? JSON.stringify(input.steps) : null,
      now,
      now,
    ]
  );

  return id;
}

export async function updateRecipeLocal(id: string, patch: UpdateRecipeInput): Promise<void> {
  if (IS_WEB) {
    await updateRecipe(id, patch);
    notifyDataChanged();
    return;
  }

  const sets: string[] = [];
  const params: any[] = [];
  const push = (col: string, value: any) => {
    sets.push(`${col} = ?`);
    params.push(value);
  };

  if (patch.title !== undefined) push('title', patch.title);
  if (patch.category !== undefined) push('category', patch.category);
  if (patch.description !== undefined) push('description', patch.description);
  if (patch.image !== undefined) push('image', patch.image);
  if (patch.calories !== undefined) push('calories', patch.calories);
  if (patch.ingredients !== undefined) {
    push('ingredients', patch.ingredients ? JSON.stringify(patch.ingredients) : null);
  }
  if (patch.nutritions !== undefined) {
    push('nutritions', patch.nutritions ? JSON.stringify(patch.nutritions) : null);
  }
  if (patch.steps !== undefined) {
    push('steps', patch.steps ? JSON.stringify(patch.steps) : null);
  }

  if (sets.length === 0) return;
  await buildUpdate('recipes', sets, params, id);
}

// Soft delete — archives the recipe (deleted_at set) rather than removing
// the row, since meals are always backed by a recipe now and shouldn't lose
// their history if the recipe they came from gets "deleted".
export async function deleteRecipeLocal(id: string): Promise<void> {
  if (IS_WEB) {
    await deleteRecipe(id);
    notifyDataChanged();
    return;
  }
  await powersync.execute('UPDATE recipes SET deleted_at = ? WHERE id = ?', [
    new Date().toISOString(),
    id,
  ]);
}

export type UpdateUserLocalInput = Partial<
  Pick<
    UserProfile,
    'name' | 'dietGoal' | 'dailyCalorieTarget' | 'isActive' | 'units' | 'remindersEnabled' | 'avatarUrl'
  >
>;

export async function updateUserLocal(id: string, patch: UpdateUserLocalInput): Promise<void> {
  if (IS_WEB) {
    await updateUser(id, patch);
    notifyDataChanged();
    return;
  }

  const sets: string[] = [];
  const params: any[] = [];
  const push = (col: string, value: any) => {
    sets.push(`${col} = ?`);
    params.push(value);
  };

  if (patch.name !== undefined) push('name', patch.name);
  if (patch.dietGoal !== undefined) push('diet_goal', patch.dietGoal);
  if (patch.dailyCalorieTarget !== undefined) push('daily_calorie_target', patch.dailyCalorieTarget);
  if (patch.isActive !== undefined) push('is_active', patch.isActive ? 1 : 0);
  if (patch.units !== undefined) push('units', patch.units);
  if (patch.remindersEnabled !== undefined) push('reminders_enabled', patch.remindersEnabled ? 1 : 0);
  if (patch.avatarUrl !== undefined) push('avatar_url', patch.avatarUrl);

  if (sets.length === 0) return;
  await buildUpdate('"user"', sets, params, id);
}
