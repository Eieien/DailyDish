import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@powersync/react';

import type { MealRow } from '../lib/meals';
import { getMealsForDate, localIsoDate } from '../lib/meals';
import { parseJsonColumn, toBool } from '../powersync/utils';
import { subscribeToDataRefresh } from '../lib/dataRefresh';

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

function useMealsForDateNative(userId: string | null | undefined, date?: string): MealRow[] {
  const targetDate = date ?? localIsoDate();
  const { data } = useQuery<any>(
    'SELECT * FROM meal WHERE user_id = ? AND meal_date = ? ORDER BY created_at',
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
