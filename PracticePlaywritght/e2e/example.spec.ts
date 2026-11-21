import {test, expect} from '@playwright/test';

test('Abrir tools y validar titulo', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Practice Software Testing - Toolshop - v5.0');
    await page.pause();
});

test('Buscar un martillo', async ({page}) => {
    await page.goto('/');
    await page.getByTestId('search-query').click();
    await page.getByTestId('search-query').fill('Hammer');
    await page.keyboard.press('Enter');
    await expect(page.getByText(' Claw Hammer with Shock Reduction Grip ')).toBeVisible();
    await page.pause();
})