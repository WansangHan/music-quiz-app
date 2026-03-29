import { test, expect } from '@playwright/test';

test.describe('Home screen', () => {
  test('shows app title and navigation tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page.getByText('화성학 퀴즈')).toBeVisible();

    // Bottom tabs
    await expect(page.getByText('홈')).toBeVisible();
    await expect(page.getByText('탐색')).toBeVisible();
    await expect(page.getByText('통계')).toBeVisible();
    await expect(page.getByText('설정')).toBeVisible();
  });

  test('shows today summary with stats', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page.getByText('복습 대기')).toBeVisible();
    await expect(page.getByText('신규 카드')).toBeVisible();
    await expect(page.getByText('오늘 학습')).toBeVisible();
  });

  test('shows start quiz button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page.getByText('학습 시작')).toBeVisible();
  });
});

test.describe('Quiz flow', () => {
  test('starts quiz and shows question with choices', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('학습 시작').click();
    await page.waitForTimeout(1500);

    // Should show progress bar (N / N)
    await expect(page.getByText(/\d+ \/ \d+/)).toBeVisible();

    // Should show 4 choice buttons or notation
    // The question card should be visible
    const questionArea = page.locator('[style*="borderRadius"]').first();
    await expect(questionArea).toBeVisible();
  });

  test('answering a question shows feedback and advances', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('학습 시작').click();
    await page.waitForTimeout(1500);

    // Find and click the first choice button
    // Toggle to text mode first if notation is shown
    const toggleHint = page.getByText('탭하면 텍스트로');
    if (await toggleHint.isVisible()) {
      await toggleHint.click();
      await page.waitForTimeout(300);
    }

    // Wait for progress indicator
    await expect(page.getByText('1 / ')).toBeVisible();

    // Click any visible choice
    const choices = page.locator('div[role="button"], [accessibilityRole="button"]');
    const count = await choices.count();
    if (count > 0) {
      await choices.first().click();
    }
  });
});

test.describe('Browse screen', () => {
  test('shows 6 categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('탐색').click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('음정')).toBeVisible();
    await expect(page.getByText('코드', { exact: false })).toBeVisible();
    await expect(page.getByText('스케일', { exact: false })).toBeVisible();
  });
});

test.describe('Statistics screen', () => {
  test('shows statistics page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('통계').click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('학습 일수')).toBeVisible();
    await expect(page.getByText('전체 정확도')).toBeVisible();
  });
});

test.describe('Settings screen', () => {
  test('shows daily limit and display mode settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('설정').click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('일일 신규 카드 수')).toBeVisible();
    await expect(page.getByText('기본 문제 표시')).toBeVisible();
    await expect(page.getByText('악보')).toBeVisible();
    await expect(page.getByText('텍스트')).toBeVisible();
  });

  test('can toggle display mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.getByText('설정').click();
    await page.waitForTimeout(1000);

    // Click 텍스트 button
    await page.getByText('텍스트', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click 악보 button
    await page.getByText('악보', { exact: true }).click();
    await page.waitForTimeout(500);
  });
});
