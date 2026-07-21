import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getMealHistory, type DayHistory } from './meals';

// expo-secure-store keys may only contain alphanumerics, ".", "-", and "_" —
// no colons — so this can't use the more readable "dailydish:..." form.
const RECAP_KEY_PREFIX = 'dailydish.lastRecapDate.';

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function yesterdayIso(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString('en-CA');
}

async function getStored(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function setStored(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

/** Recap is only offered once we're actually into the next day (after 1AM). */
export function isPastRecapCutoff(now: Date = new Date()): boolean {
  return now.getHours() >= 1;
}

export async function hasShownRecapToday(userId: string): Promise<boolean> {
  const stored = await getStored(RECAP_KEY_PREFIX + userId);
  return stored === todayIso();
}

export async function markRecapShown(userId: string): Promise<void> {
  await setStored(RECAP_KEY_PREFIX + userId, todayIso());
}

export async function getYesterdaysTotals(userId: string): Promise<DayHistory | undefined> {
  const history = await getMealHistory(userId, 2);
  return history.find((day) => day.date === yesterdayIso());
}

/**
 * Plain templated text — deliberately not an LLM call. This is arithmetic
 * over already-known data, so there's no reason to spend tokens/latency
 * asking Gemini to restate numbers we already have.
 */
export function buildRecapText(
  yesterday: DayHistory | undefined,
  dailyCalorieTarget: number | null
): string {
  if (!yesterday || yesterday.mealCount === 0) {
    return "You didn't log any meals yesterday. Let's start fresh today!";
  }

  const mealWord = yesterday.mealCount === 1 ? 'meal' : 'meals';
  const lines = [
    `Here's your recap for yesterday: ${yesterday.calories} kcal across ${yesterday.mealCount} ${mealWord} (${yesterday.protein}g protein, ${yesterday.fat}g fat, ${yesterday.carbs}g carbs).`,
  ];

  if (dailyCalorieTarget) {
    const diff = dailyCalorieTarget - yesterday.calories;
    lines.push(
      diff >= 0
        ? `That's ${diff} kcal under your ${dailyCalorieTarget} kcal goal — nice work!`
        : `That's ${Math.abs(diff)} kcal over your ${dailyCalorieTarget} kcal goal.`
    );
  }

  return lines.join(' ');
}
