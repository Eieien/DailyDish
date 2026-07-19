import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
  UpdateType,
} from '@powersync/common';

import { createRecipe, updateRecipe, deleteRecipe } from '../_lib/recipes';
import { createMeal, updateMeal, deleteMeal } from '../_lib/meals';
import { postUsers, updateUser } from '../_lib/user';
import { parseJsonColumn, toBool } from './utils';

type GetToken = (options: { template: string }) => Promise<string | null>;

export class Connector implements PowerSyncBackendConnector {
  constructor(private getToken: GetToken) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    let token: string | null = null;
    try {
      token = await this.getToken({ template: 'powersync' });
    } catch (error) {
      console.log('[PowerSync] getToken({ template: "powersync" }) threw:', error);
      throw error;
    }

    if (!token) {
      console.log(
        '[PowerSync] getToken returned null/empty for template "powersync" — ' +
          'connect() will silently keep retrying without this. Check that the ' +
          '"powersync" JWT Template actually exists in the Clerk Dashboard.'
      );
      return null;
    }

    console.log(
      `[PowerSync] got token (length ${token.length}), first 12 chars: ${token.slice(0, 12)}...`
    );

    const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_URL;
    console.log('[PowerSync] endpoint:', endpoint);
    if (!endpoint) {
      throw new Error('EXPO_PUBLIC_POWERSYNC_URL is not set');
    }

    return { endpoint, token };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    for (const op of transaction.crud) {
      const data = op.opData ?? {};

      switch (op.table) {
        case 'user':
          await this.uploadUser(op.op, op.id, data);
          break;
        case 'recipes':
          await this.uploadRecipe(op.op, op.id, data);
          break;
        case 'meal':
          await this.uploadMeal(op.op, op.id, data);
          break;
      }
    }

    await transaction.complete();
  }

  private async uploadUser(op: UpdateType, id: string, data: Record<string, any>) {
    if (op === UpdateType.DELETE) return;

    if (op === UpdateType.PUT) {
      await postUsers({ id, name: data.name });
    }

    await updateUser(id, {
      name: data.name,
      dietGoal: data.diet_goal ?? null,
      dailyCalorieTarget: data.daily_calorie_target ?? null,
      isActive: data.is_active !== undefined ? toBool(data.is_active) : undefined,
      units: data.units,
      remindersEnabled:
        data.reminders_enabled !== undefined ? toBool(data.reminders_enabled) : undefined,
      avatarUrl: data.avatar_url ?? null,
    });
  }

  private async uploadRecipe(op: UpdateType, id: string, data: Record<string, any>) {
    if (op === UpdateType.DELETE) {
      await deleteRecipe(id);
      return;
    }

    const patch = {
      title: data.title,
      category: data.category ?? null,
      description: data.description ?? null,
      image: data.image ?? null,
      calories: data.calories ?? null,
      ingredients: parseJsonColumn(data.ingredients),
      nutritions: parseJsonColumn(data.nutritions),
      steps: parseJsonColumn(data.steps),
    };

    if (op === UpdateType.PUT) {
      await createRecipe({ id, userId: data.user_id, ...patch });
    } else {
      await updateRecipe(id, patch);
    }
  }

  private async uploadMeal(op: UpdateType, id: string, data: Record<string, any>) {
    if (op === UpdateType.DELETE) {
      await deleteMeal(id);
      return;
    }

    const patch = {
      title: data.title,
      category: data.category ?? null,
      calories: data.calories ?? null,
      imageUrl: data.image_url ?? null,
      completed: data.completed !== undefined ? toBool(data.completed) : undefined,
      nutritions: parseJsonColumn(data.nutritions),
      ingredients: parseJsonColumn(data.ingredients),
    };

    if (op === UpdateType.PUT) {
      await createMeal({
        id,
        userId: data.user_id,
        recipeId: data.recipe_id ?? null,
        mealDate: data.meal_date,
        ...patch,
      });
    } else {
      await updateMeal(id, patch);
    }
  }
}
