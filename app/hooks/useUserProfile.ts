import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@powersync/react';

import type { UserProfile } from '../lib/user';
import { getUser } from '../lib/user';
import { toBool } from '../powersync/utils';
import { subscribeToDataRefresh } from '../lib/dataRefresh';

export function mapUserRow(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: toBool(row.is_active),
    dietGoal: row.diet_goal,
    dailyCalorieTarget: row.daily_calorie_target,
    units: row.units,
    remindersEnabled: toBool(row.reminders_enabled),
    avatarUrl: row.avatar_url,
  };
}

function useUserProfileNative(id: string | null | undefined): UserProfile | null {
  const { data } = useQuery<any>('SELECT * FROM "user" WHERE id = ?', [id ?? '']);

  return useMemo(() => {
    const row = data?.[0];
    return row ? mapUserRow(row) : null;
  }, [data]);
}

// PowerSync's web sync has never reliably connected, so web falls back to the
// same direct REST fetch this screen used before PowerSync existed.
function useUserProfileWeb(id: string | null | undefined): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const load = useCallback(() => {
    if (!id) {
      setProfile(null);
      return () => {};
    }
    let cancelled = false;
    getUser(id)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useFocusEffect(useCallback(() => load(), [load]));

  // Writes made without leaving the screen (e.g. a modal save) wouldn't
  // otherwise trigger a refetch since useFocusEffect only fires on
  // navigation — see app/lib/dataRefresh.ts.
  useEffect(() => subscribeToDataRefresh(load), [load]);

  return profile;
}

export function useUserProfile(id: string | null | undefined): UserProfile | null {
  return Platform.OS === 'web' ? useUserProfileWeb(id) : useUserProfileNative(id);
}
