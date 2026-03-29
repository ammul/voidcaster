import { test, expect } from '@playwright/test'

test.describe('Spellseeker Tutorial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('.grid > div').first().locator('button', { hasText: 'Tutorial' }).click()
  })

  test('loads with hand zone visible', async ({ page }) => {
    await expect(page.locator('text=Hand')).toBeVisible()
  })

  test('Next Step button is visible and advances the step counter', async ({ page }) => {
    const nextBtn = page.locator('button', { hasText: 'Next Step' })
    await expect(nextBtn).toBeVisible()

    // Step counter should show 0 / 30 initially
    await expect(page.locator('text=Step 0 / 30')).toBeVisible()

    await nextBtn.click()
    await expect(page.locator('text=Step 1 / 30')).toBeVisible()
  })

  test('tutorial sidebar shows combo name', async ({ page }) => {
    await expect(page.locator('text=Spellseeker Line')).toBeVisible()
  })

  test('legal footer is visible during the tutorial', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer')).toContainText('Wizards of the Coast')
  })
})
