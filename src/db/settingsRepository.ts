import { getDb } from './client';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';
import type { DisplayMode } from '../types/settings';
import { SettingsKey } from '../constants/settingsKeys';

export async function getSettings(): Promise<UserSettings> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM user_settings',
  );

  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    dailyNewLimit: parseInt(map.get(SettingsKey.DailyNewLimit) ?? String(DEFAULT_SETTINGS.dailyNewLimit), 10),
    defaultDisplay: (map.get(SettingsKey.DefaultNotation) ?? DEFAULT_SETTINGS.defaultDisplay) as DisplayMode,
  };
}

export async function updateSetting(key: SettingsKey, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    key,
    value,
  );
}
