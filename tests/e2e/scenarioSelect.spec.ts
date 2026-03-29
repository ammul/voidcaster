import { test, expect } from '@playwright/test'

test.describe('Scenario Select', () => {
  test('page loads and displays 3 scenario cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Voidcaster')
    const scenarioCards = page.locator('.grid > div')
    await expect(scenarioCards).toHaveCount(3)
  })

  test('clicking Tutorial navigates to simulator view', async ({ page }) => {
    await page.goto('/')
    await page.locator('.grid > div').first().locator('button', { hasText: 'Tutorial' }).click()
    await expect(page.locator('text=Back')).toBeVisible()
  })

  test('clicking Free Play navigates to simulator view', async ({ page }) => {
    await page.goto('/')
    await page.locator('.grid > div').first().locator('button', { hasText: 'Free Play' }).click()
    await expect(page.locator('text=Back')).toBeVisible()
  })

  test('legal footer is visible on scenario select screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer')).toContainText('Wizards of the Coast')
  })
})
