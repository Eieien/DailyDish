import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@powersync/react';

import type { MealRow } from '../_lib/meals';
import { getMealsForDate, localIsoDate } from '../_lib/meals';
import { parseJsonColumn, toBool } from '../_powersync/utils';
import { subscribeToDataRefresh } from '../_lib/dataRefresh';

export function mapMealRow(row: any): MealRow {
  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    title: row.title,
    category: row.category,
    calories: row.calories,
    imageUrl: row.image_url,
    completed: toBool(row.completed),
    mealDate: row.meal_date,
    nutritions: parseJsonColumn(row.nutritions),
    ingredients: parseJsonColumn<string[]>(row.ingredients),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Calories/nutrition always come live from the linked recipe (falling back to
// the meal's own stored snapshot for legacy recipe-less rows) — meal's job is
// just to log what/when/whether-eaten, not to own a separate copy of macros
// that can drift from the recipe.
export const MEAL_SELECT = `
  SELECT
    meal.id as id,
    meal.user_id as user_id,
    meal.recipe_id as recipe_id,
    meal.title as title,
    meal.category as category,
    COALESCE(recipes.calories, meal.calories) as calories,
    meal.image_url as image_url,
    meal.completed as completed,
    meal.meal_date as meal_date,
    COALESCE(recipes.nutritions, meal.nutritions) as nutritions,
    meal.ingredients as ingredients,
    meal.created_at as created_at,
    meal.updated_at as updated_at
  FROM meal
  LEFT JOIN recipes ON recipes.id = meal.recipe_id
`;

function useMealsForDateNative(userId: string | null | undefined, date?: string): MealRow[] {
  const targetDate = date ?? localIsoDate();
  const { data } = useQuery<any>(
    `${MEAL_SELECT} WHERE meal.user_id = ? AND meal.meal_date = ? ORDER BY meal.created_at`,
    [userId ?? '', targetDate]
  );

  return useMemo(() => (data ?? []).map(mapMealRow), [data]);
}

// PowerSync's web sync has never reliably connected, so web falls back to the
// same direct REST fetch these screens used before PowerSync existed.
function useMealsForDateWeb(userId: string | null | undefined, date?: string): MealRow[] {
  const targetDate = date ?? localIsoDate();
  const [rows, setRows] = useState<MealRow[]>([]);

  const load = useCallback(() => {
    if (!userId) {
      setRows([]);
      return () => {};
    }
    let cancelled = false;
    getMealsForDate(userId, targetDate)
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, targetDate]);

  useFocusEffect(useCallback(() => load(), [load]));

  // Writes made without leaving the screen (e.g. a modal save) wouldn't
  // otherwise trigger a refetch since useFocusEffect only fires on
  // navigation — see app/lib/dataRefresh.ts.
  useEffect(() => subscribeToDataRefresh(load), [load]);

  return rows;
}

export function useMealsForDate(userId: string | null | undefined, date?: string): MealRow[] {
  return Platform.OS === 'web'
    ? useMealsForDateWeb(userId, date)
    : useMealsForDateNative(userId, date);
}
