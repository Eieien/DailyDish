export type Macro = {
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
};

export type Ingredient = {
  id: string;
  label: string;
};

export type Recipe = {
  id: string;
  title: string;
  image: string; // remote URL or require(...) result
  description: string;
  macros: Macro;
  ingredients: Ingredient[];
  steps: string[];
};

export type MealSlot = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export type MealEntry = {
  id: string;
  slot: MealSlot;
  recipeTitle: string;
  calories: number;
  imageUrl: string;
  completed: boolean;
};

export type DailyProgress = {
  goalCalories: number;
  foodCalories: number;
  protein: { current: number; goal: number };
  fat: { current: number; goal: number };
  carbs: { current: number; goal: number };
};
