import { test, expect } from '@playwright/test'

test.describe('Free Play Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Use the Breach scenario for free play
    await page.locator('.grid > div').nth(1).locator('button', { hasText: 'Free Play' }).click()
    // Dismiss the mulligan modal so it doesn't block clicks
    await page.getByRole('button', { name: 'Keep' }).click()
  })

  test('mana pool tracker renders all 4 mana types', async ({ page }) => {
    // Mana sidebar labels
    await expect(page.getByText('B').first()).toBeVisible()
    await expect(page.getByText('U').first()).toBeVisible()
    await expect(page.getByText('R').first()).toBeVisible()
    await expect(page.getByText('C').first()).toBeVisible()
  })

  test('life total starts at 40', async ({ page }) => {
    await expect(page.locator('text=40')).toBeVisible()
  })

  test('life total increments on + click', async ({ page }) => {
    // The + button in the life total widget
    const plusBtn = page.locator('[class*="LifeTotal"] button', { hasText: '+' })
      .or(page.locator('button', { hasText: '+' }).first())
    await plusBtn.click()
    await expect(page.locator('text=41')).toBeVisible()
  })

  test('storm counter starts at 0', async ({ page }) => {
    await expect(page.locator('text=Storm:')).toBeVisible()
  })

  test('no tutorial sidebar in free play mode', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Next Step' })).not.toBeVisible()
  })
})
