import { Database } from './types';

type Migration = (db: Database) => Promise<void>;

const migrations: Migration[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        display_name TEXT NOT NULL,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        topic_id TEXT PRIMARY KEY REFERENCES topics(id),
        mastery_level INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        interval_days REAL NOT NULL DEFAULT 0,
        next_review_at TEXT NOT NULL,
        last_reviewed_at TEXT,
        total_reviews INTEGER NOT NULL DEFAULT 0,
        total_correct INTEGER NOT NULL DEFAULT 0,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        total_cards INTEGER NOT NULL DEFAULT 0,
        correct_count INTEGER NOT NULL DEFAULT 0,
        wrong_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS session_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER REFERENCES quiz_sessions(id),
        topic_id TEXT REFERENCES topics(id),
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        answered_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_stats (
        date TEXT PRIMARY KEY,
        reviews_done INTEGER NOT NULL DEFAULT 0,
        correct_count INTEGER NOT NULL DEFAULT 0,
        new_cards_seen INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS _meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  },
];

export async function runMigrations(db: Database): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM _meta WHERE key = 'schema_version'"
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  for (let i = currentVersion; i < migrations.length; i++) {
    await migrations[i](db);
  }

  if (currentVersion === 0) {
    await db.runAsync(
      "INSERT INTO _meta (key, value) VALUES ('schema_version', ?)",
      String(migrations.length)
    );
  } else if (currentVersion < migrations.length) {
    await db.runAsync(
      "UPDATE _meta SET value = ? WHERE key = 'schema_version'",
      String(migrations.length)
    );
  }
}
