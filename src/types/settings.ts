import { DEFAULT_DAILY_NEW_LIMIT } from '../constants/quiz';

export type DisplayMode = 'notation' | 'text';

export interface UserSettings {
  dailyNewLimit: number;
  defaultDisplay: DisplayMode;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyNewLimit: DEFAULT_DAILY_NEW_LIMIT,
  defaultDisplay: 'notation',
};
