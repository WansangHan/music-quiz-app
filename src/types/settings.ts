import { DEFAULT_DAILY_NEW_LIMIT } from '../constants/quiz';

export interface UserSettings {
  dailyNewLimit: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyNewLimit: DEFAULT_DAILY_NEW_LIMIT,
};
