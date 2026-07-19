import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@powersync/react';

import type { RecipeRow } from '../lib/recipes';
import { getRecipeById, getRecipes } from '../lib/recipes';
import { parseJsonColumn } from '../powersync/utils';
import { subscribeToDataRefresh } from '../lib/dataRefresh';

export function mapRecipeRow(row: any): RecipeRow {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    description: row.description,
    image: row.image,
    calories: row.calories,
    ingredients: parseJsonColumn<string[]>(row.ingredients),
    nutritions: parseJsonColumn(row.nutritions),
    steps: parseJsonColumn<string[]>(row.steps),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function useRecipesNative(userId: string | null | undefined): RecipeRow[] {
  // Archived (soft-deleted) recipes are excluded, matching the web/REST list
  // endpoint — see app/api/recipes+api.ts.
  const { data } = useQuery<any>(
    'SELECT * FROM recipes WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
    [userId ?? '']
  );

  return useMemo(() => (data ?? []).map(mapRecipeRow), [data]);
}

// PowerSync's web sync has never reliably connected, so web falls back to the
// same direct REST fetch these screens used before PowerSync existed.
function useRecipesWeb(userId: string | null | undefined): RecipeRow[] {
  const [rows, setRows] = useState<RecipeRow[]>([]);

  const load = useCallback(() => {
    if (!userId) {
      setRows([]);
      return () => {};
    }
    let cancelled = false;
    getRecipes(userId)
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useFocusEffect(useCallback(() => load(), [load]));

  // Writes made without leaving the screen (e.g. a modal save) wouldn't
  // otherwise trigger a refetch since useFocusEffect only fires on
  // navigation — see app/lib/dataRefresh.ts.
  useEffect(() => subscribeToDataRefresh(load), [load]);

  return rows;
}

export function useRecipes(userId: string | null | undefined): RecipeRow[] {
  return Platform.OS === 'web' ? useRecipesWeb(userId) : useRecipesNative(userId);
}

function useRecipeByIdNative(id: string | null | undefined): {
  recipe: RecipeRow | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery<any>('SELECT * FROM recipes WHERE id = ?', [id ?? '']);

  const recipe = useMemo(() => {
    const row = data?.[0];
    return row ? mapRecipeRow(row) : null;
  }, [data]);

  return { recipe, isLoading };
}

function useRecipeByIdWeb(id: string | null | undefined): {
  recipe: RecipeRow | null;
  isLoading: boolean;
} {
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) {
      setIsLoading(false);
      return () => {};
    }
    let cancelled = false;
    setIsLoading(true);
    getRecipeById(id)
      .then((result) => {
        if (!cancelled) {
          setRecipe(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useFocusEffect(useCallback(() => load(), [load]));
  useEffect(() => subscribeToDataRefresh(load), [load]);

  return { recipe, isLoading };
}

export function useRecipeById(id: string | null | undefined): {
  recipe: RecipeRow | null;
  isLoading: boolean;
} {
  return Platform.OS === 'web' ? useRecipeByIdWeb(id) : useRecipeByIdNative(id);
}
