import { test, expect } from '@playwright/test';

const API_URL = (process.env.LIVE_API_URL || '').replace(/\/$/, '');

test.describe('JustDoIt - Scenariusze E2E UI w chmurze Azure', () => {
  test('Aplikacja ładuje się poprawnie po HTTPS i wyświetla listę zadań', async ({ page }) => {
    const tasksResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/tasks') && res.request().method() === 'GET'
    );

    await page.goto('/');
    const tasksResponse = await tasksResponsePromise;

    expect(tasksResponse.status()).toBe(200);
    await expect(page.locator('form')).toBeVisible();
  });

  test('Użytkownik może dodać nowe zadanie przez formularz i zapisać je w bazie', async ({ page, request }) => {
    const uniqueTitle = `Nowy Wpis E2E ${Date.now()}`;

    // 1. Załadowanie aplikacji w chmurze
    await page.goto('/');
    await expect(page.locator('form')).toBeVisible();

    // 2. Wypełnienie formularza (tytuł + ewentualne pozostałe pola tekstowe i data)
    const textInputs = page.locator('form input[type="text"], form input:not([type])');
    const textInputCount = await textInputs.count();
    expect(textInputCount).toBeGreaterThan(0);

    await textInputs.nth(0).fill(uniqueTitle);
    for (let i = 1; i < textInputCount; i++) {
      const currentVal = await textInputs.nth(i).inputValue();
      if (!currentVal) {
        await textInputs.nth(i).fill('Test E2E');
      }
    }

    const dateInput = page.locator('form input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill('2026-12-01');
    }

    // 3. Wysłanie formularza i weryfikacja odpowiedzi 201 z REST API
    const createResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/tasks') && res.request().method() === 'POST'
    );
    await page.locator('form button[type="submit"]').first().click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    const createdBody = await createResponse.json();
    const createdId = createdBody.id || createdBody.task?.id;

    // 4. Asercja widoczności nowego elementu na liście UI (również po odświeżeniu)
    await expect(page.locator('body')).toContainText(uniqueTitle);
    await page.reload();
    await expect(page.locator('body')).toContainText(uniqueTitle);

    // 5. Sprzątanie testowego rekordu przez API
    if (API_URL && createdId) {
      await request.delete(`${API_URL}/api/tasks/${createdId}`);
    }
  });
});
