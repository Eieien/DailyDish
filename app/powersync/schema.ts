import { column, Schema, Table } from '@powersync/common';

const user = new Table({
  name: column.text,
  created_at: column.text,
  updated_at: column.text,
  is_active: column.integer,
  diet_goal: column.text,
  daily_calorie_target: column.integer,
  units: column.text,
  reminders_enabled: column.integer,
  avatar_url: column.text,
});

const recipes = new Table(
  {
    user_id: column.text,
    title: column.text,
    category: column.text,
    description: column.text,
    image: column.text,
    calories: column.integer,
    ingredients: column.text,
    nutritions: column.text,
    steps: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  { indexes: { user: ['user_id'] } }
);

const meal = new Table(
  {
    user_id: column.text,
    recipe_id: column.text,
    title: column.text,
    category: column.text,
    calories: column.integer,
    image_url: column.text,
    completed: column.integer,
    meal_date: column.text,
    nutritions: column.text,
    ingredients: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  { indexes: { user_date: ['user_id', 'meal_date'] } }
);

export const AppSchema = new Schema({
  user,
  recipes,
  meal,
});

export type Database = (typeof AppSchema)['types'];
