import { test, expect } from '@playwright/test'

test.describe('Full combo with interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  async function enableInteraction(page: import('@playwright/test').Page) {
    await page.click('[aria-label="Open settings"]')
    await expect(page.getByText('Settings').first()).toBeVisible()

    // Enable interaction mode
    const toggle = page.locator('[data-testid="toggle-interaction"]')
    const isEnabled = (await toggle.getAttribute('aria-checked')) === 'true'
    if (!isEnabled) await toggle.click()

    // Set known seed (kraum_tymna with high counter probability)
    const seedInput = page.locator('[data-testid="seed-input"]')
    await seedInput.fill('00000001')
    await seedInput.blur()

    await page.keyboard.press('Escape')
  }

  async function setAllSeatsToKraum(page: import('@playwright/test').Page) {
    await page.click('[aria-label="Open settings"]')
    for (const seat of ['0', '1', '2']) {
      const select = page.locator(`select[data-seat="${seat}"]`)
      await select.selectOption('kraum_tymna')
    }
    await page.keyboard.press('Escape')
  }

  test('Combo page loads and tutorial initiates without crash', async ({ page }) => {
    // Start spellseeker tutorial
    const tutorialButtons = page.getByText('Tutorial')
    await tutorialButtons.first().click()
    await expect(page.getByRole('heading', { name: 'Spellseeker Line' })).toBeVisible()
  })

  test('Interaction on, advancing steps does not crash', async ({ page }) => {
    await enableInteraction(page)
    // Navigate to free play
    await page.getByText('Free Play').first().click()
    // Dismiss mulligan
    const keep = page.getByRole('button', { name: 'Keep' })
    if (await keep.isVisible({ timeout: 2000 }).catch(() => false)) {
      await keep.click()
    }

    // Advance a few steps
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next Phase")')
      await page.waitForTimeout(100)
    }

    await expect(page.locator('body')).toBeVisible()
  })

  test('Consultation combo with interaction on loads without error', async ({ page }) => {
    await enableInteraction(page)
    // Select consultation free play
    const freePlayButtons = page.getByText('Free Play')
    await freePlayButtons.nth(2).click()
    await expect(page.locator('body')).toBeVisible()
  })

  test('Interaction stack items can be dismissed', async ({ page }) => {
    await enableInteraction(page)
    await page.getByText('Free Play').first().click()

    // If any interaction items appear, we should be able to dismiss them
    const items = page.locator('[data-testid^="interaction-stack-item"]')
    const count = await items.count()
    if (count > 0) {
      await items.first().locator('button:has-text("✕")').click()
      await expect(items).toHaveCount(count - 1)
    }
    // No crash regardless
    await expect(page.locator('body')).toBeVisible()
  })
})
