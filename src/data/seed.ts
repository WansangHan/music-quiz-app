import { Database } from '../db/types';
import { TOPICS } from './topics';
import { DEFAULT_SETTINGS } from '../types/settings';
import { SettingsKey } from '../constants/settingsKeys';
import { toISOString } from '../lib/dateUtils';

export async function seedDatabase(db: Database): Promise<void> {
  const count = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM topics'
  );
  if (count && count.cnt > 0) return;

  await db.execAsync('BEGIN TRANSACTION;');

  try {
    const now = toISOString(new Date());

    for (const topic of TOPICS) {
      await db.runAsync(
        `INSERT INTO topics (id, category, display_name, question, correct_answer, description, difficulty, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        topic.id,
        topic.category,
        topic.displayName,
        topic.question,
        topic.correctAnswer,
        topic.description,
        topic.difficulty,
        topic.sortOrder,
      );

      await db.runAsync(
        `INSERT INTO user_progress (topic_id, mastery_level, streak, ease_factor, interval_days, next_review_at, is_unlocked, updated_at)
         VALUES (?, 0, 0, 2.5, 0, ?, 0, ?)`,
        topic.id,
        now,
        now,
      );
    }

    await db.runAsync(
      'INSERT OR IGNORE INTO user_settings (key, value) VALUES (?, ?)',
      SettingsKey.DailyNewLimit,
      String(DEFAULT_SETTINGS.dailyNewLimit),
    );

    await db.execAsync('COMMIT;');
  } catch (err) {
    await db.execAsync('ROLLBACK;');
    throw err;
  }
}
