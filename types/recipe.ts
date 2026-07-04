/** Nutrition figures displayed in the stat cards at the top of a recipe. */
export interface RecipeNutrition {
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

/** A single prepared dish rendered by the recipe details screen. */
export interface Recipe {
  id: string;
  title: string;
  image: string;
  nutrition: RecipeNutrition;
  ingredients: string[];
  steps: string[];
}
