import { DailyProgress, MealEntry, Recipe } from "./types";

export const dailyProgress: DailyProgress = {
  goalCalories: 2000,
  foodCalories: 1250,
  protein: { current: 47, goal: 70 },
  fat: { current: 76, goal: 120 },
  carbs: { current: 25, goal: 40 },
};

export const todaysMeals: MealEntry[] = [
  {
    id: "m1",
    slot: "Breakfast",
    recipeTitle: "Tortang Talong",
    calories: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200",
    completed: true,
  },
  {
    id: "m2",
    slot: "Lunch",
    recipeTitle: "Bangus",
    calories: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200",
    completed: true,
  },
  {
    id: "m3",
    slot: "Dinner",
    recipeTitle: "Lechon Manok",
    calories: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200",
    completed: false,
  },
  {
    id: "m4",
    slot: "Snacks",
    recipeTitle: "Almonds",
    calories: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200",
    completed: false,
  },
];

export const recipes: Recipe[] = [
  {
    id: "pinoy-breakfast",
    title: "Pinoy Breakfast",
    description: "400 calorie pinoy breakfast with egg, longganisa",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
    macros: { calories: 400, protein: 18, fat: 16, carbs: 42 },
    ingredients: [
      { id: "i1", label: "Egg (fried)" },
      { id: "i2", label: "Longganisa" },
      { id: "i3", label: "Cooked Rice" },
      { id: "i4", label: "Salt & Pepper" },
      { id: "i5", label: "Garlic" },
      { id: "i6", label: "Cooking Oil" },
    ],
    steps: [
      "Heat oil in a pan over medium heat. Fry the longganisa until cooked, about 5 minutes.",
      "In the same pan, fry the egg to your preference (sunny side up or over easy).",
      "In another pan, heat oil and stir-fry the cooked rice with minced garlic, salt, and pepper for 3-4 minutes.",
      "Plate the fried rice, arrange the longganisa and fried egg on top. Serve hot with fresh cucumber slices.",
    ],
  },
  {
    id: "avocado-toast",
    title: "Avocado Toast",
    description: "280 calorie avocado toast with egg",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800",
    macros: { calories: 280, protein: 10, fat: 14, carbs: 28 },
    ingredients: [
      { id: "i1", label: "Bread slice" },
      { id: "i2", label: "Avocado" },
      { id: "i3", label: "Egg" },
      { id: "i4", label: "Salt & Pepper" },
    ],
    steps: [
      "Toast the bread until golden.",
      "Mash the avocado and spread over the toast.",
      "Fry or poach the egg and place on top.",
      "Season with salt and pepper.",
    ],
  },
  {
    id: "cereal-bowl",
    title: "Cereal Bowl",
    description: "300 calorie cereal bowl with banana, blueberry, and nuts",
    image:
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800",
    macros: { calories: 300, protein: 9, fat: 8, carbs: 48 },
    ingredients: [
      { id: "i1", label: "Cereal" },
      { id: "i2", label: "Milk" },
      { id: "i3", label: "Banana" },
      { id: "i4", label: "Blueberries" },
      { id: "i5", label: "Mixed Nuts" },
    ],
    steps: [
      "Pour cereal into a bowl.",
      "Add milk.",
      "Top with sliced banana, blueberries, and mixed nuts.",
    ],
  },
  {
    id: "champorado",
    title: "Champorado",
    description: "280 calorie champorado with chocolate",
    image:
      "https://images.unsplash.com/photo-1517093157656-b9eccef01cb1?w=800",
    macros: { calories: 280, protein: 6, fat: 5, carbs: 54 },
    ingredients: [
      { id: "i1", label: "Glutinous Rice" },
      { id: "i2", label: "Cocoa Powder" },
      { id: "i3", label: "Sugar" },
      { id: "i4", label: "Evaporated Milk" },
    ],
    steps: [
      "Boil glutinous rice in water until soft and thick.",
      "Stir in cocoa powder and sugar.",
      "Serve hot, drizzled with evaporated milk.",
    ],
  },
];
