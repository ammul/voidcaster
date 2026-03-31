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

    // Step 1 validates Spellseeker on battlefield + mana for {2}{U}.
    // Inject the required game state via Pinia so canAdvance becomes true.
    await page.evaluate(() => {
      // @ts-ignore
      const pinia = window.__vue_app__?.config?.globalProperties?.$pinia
      if (!pinia) return
      const game = pinia.state.value.game
      game.manaPool.C = 2
      game.manaPool.U = 1
      game.allCards.push({
        instanceId: 'e2e-spellseeker',
        name: 'Spellseeker',
        scryfallData: null, artCropUrl: null, normalImageUrl: null,
        isLoading: false, isToken: false, tapped: false,
        zone: 'battlefield', markedForExile: false, highlightedInTutorial: false,
      })
    })

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
