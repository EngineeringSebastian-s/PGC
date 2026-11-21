import {test, expect} from '@playwright/test';

test('Abrir tools y validar titulo', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Practice Software Testing - Toolshop - v5.0');
    await page.pause();
});
