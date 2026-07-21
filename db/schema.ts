import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  // password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  dietGoal: text('diet_goal'),
  dailyCalorieTarget: integer('daily_calorie_target'),
  units: text('units').default('metric').notNull(),
  remindersEnabled: boolean('reminders_enabled').default(true).notNull(),
  avatarUrl: text('avatar_url'),
});

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    category: text('category'),
    description: text('description'),
    image: text('image'),
    calories: integer('calories'),
    ingredients: jsonb('ingredients'),
    nutritions: jsonb('nutritions'),
    steps: jsonb('steps'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    // Soft delete: every meal is backed by a recipe now (see meal.recipeId),
    // so hard-deleting a recipe would strip history off any meal logged from
    // it. "Deleting" a recipe just archives it instead.
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('recipes_user_id_idx').on(table.userId)]
);

export const meal = pgTable(
  'meal',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    category: text('category'),
    calories: integer('calories'),
    imageUrl: text('image_url'),
    completed: boolean('completed').default(false).notNull(),
    mealDate: date('meal_date').defaultNow().notNull(),
    nutritions: jsonb('nutritions'),
    ingredients: jsonb('ingredients'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('meal_user_id_idx').on(table.userId),
    index('meal_user_date_idx').on(table.userId, table.mealDate),
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    message: text('message').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('chat_messages_session_id_idx').on(table.sessionId),
    check('chat_messages_role_check', sql`${table.role} in ('user','assistant','system')`),
  ]
);
