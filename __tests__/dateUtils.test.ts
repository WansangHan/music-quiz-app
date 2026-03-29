import {
  todayStart,
  toISOString,
  isToday,
  addDays,
  formatDate,
  isPastDue,
} from '../src/lib/dateUtils';

describe('todayStart', () => {
  it('returns a date with time set to 00:00:00', () => {
    const d = todayStart();
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it('returns today\'s date', () => {
    const d = todayStart();
    const now = new Date();
    expect(d.getFullYear()).toBe(now.getFullYear());
    expect(d.getMonth()).toBe(now.getMonth());
    expect(d.getDate()).toBe(now.getDate());
  });
});

describe('toISOString', () => {
  it('returns ISO 8601 format', () => {
    const d = new Date('2026-01-15T12:30:00Z');
    const iso = toISOString(d);
    expect(iso).toBe('2026-01-15T12:30:00.000Z');
  });
});

describe('isToday', () => {
  it('returns true for current time', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it('returns true for midnight today', () => {
    const d = todayStart();
    expect(isToday(d.toISOString())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const d = addDays(todayStart(), -1);
    expect(isToday(d.toISOString())).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const d = addDays(todayStart(), 1);
    expect(isToday(d.toISOString())).toBe(false);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const result = addDays(d, 5);
    expect(result.getUTCDate()).toBe(6);
  });

  it('adds negative days', () => {
    const d = new Date('2026-01-10T00:00:00Z');
    const result = addDays(d, -3);
    expect(result.getUTCDate()).toBe(7);
  });

  it('adds fractional days', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const result = addDays(d, 0.5); // 12 hours
    expect(result.getUTCHours()).toBe(12);
  });

  it('does not mutate original date', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const original = d.getTime();
    addDays(d, 10);
    expect(d.getTime()).toBe(original);
  });
});

describe('formatDate', () => {
  it('formats as YYYY-MM-DD', () => {
    const d = new Date(2026, 0, 5); // Jan 5
    expect(formatDate(d)).toBe('2026-01-05');
  });

  it('pads single-digit month and day', () => {
    const d = new Date(2026, 2, 9); // Mar 9
    expect(formatDate(d)).toBe('2026-03-09');
  });

  it('handles double-digit month and day', () => {
    const d = new Date(2026, 11, 25); // Dec 25
    expect(formatDate(d)).toBe('2026-12-25');
  });
});

describe('isPastDue', () => {
  it('returns true when review time has passed', () => {
    const past = new Date('2020-01-01T00:00:00Z').toISOString();
    expect(isPastDue(past)).toBe(true);
  });

  it('returns false when review time is in the future', () => {
    const future = new Date('2099-01-01T00:00:00Z').toISOString();
    expect(isPastDue(future)).toBe(false);
  });

  it('returns true when review time equals now', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    expect(isPastDue(now.toISOString(), now)).toBe(true);
  });

  it('uses current time when now is not provided', () => {
    const past = '2020-01-01T00:00:00.000Z';
    expect(isPastDue(past)).toBe(true);
  });
});
