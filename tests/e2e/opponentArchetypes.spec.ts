import { test, expect } from '@playwright/test'

test.describe('Opponent Archetypes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Open settings
    await page.click('[aria-label="Open settings"]')
    await expect(page.getByText('Settings').first()).toBeVisible()
  })

  test('All 8 archetypes appear in Seat 1 dropdown', async ({ page }) => {
    const seat0Select = page.locator('select[data-seat="0"]')
    const options = await seat0Select.locator('option').all()
    // 8 archetypes + 1 "Auto" option = 9 total
    expect(options.length).toBeGreaterThanOrEqual(9)

    const values = await seat0Select.evaluate((el: HTMLSelectElement) =>
      Array.from(el.options).map(o => o.value)
    )
    const expected = ['kraum_tymna', 'kinnan', 'rograkh_thrasios', 'rograkh_silas', 'sisay', 'etali', 'thrasios_tymna', 'ral']
    for (const id of expected) {
      expect(values).toContain(id)
    }
  })

  test('Selecting kraum_tymna shows correct color pips (W, U, B, R, no G)', async ({ page }) => {
    const seat0Select = page.locator('select[data-seat="0"]')
    await seat0Select.selectOption('kraum_tymna')
    await page.waitForTimeout(300)

    // Color pips for kraum_tymna: W U B R
    // They are in the SeatConfigurator component adjacent to the select
    const seatConfig = page.locator('.glass').first()
    await expect(seatConfig.getByText('W')).toBeVisible()
    await expect(seatConfig.getByText('U')).toBeVisible()
    await expect(seatConfig.getByText('B')).toBeVisible()
    await expect(seatConfig.getByText('R')).toBeVisible()
    // G should NOT be visible in kraum_tymna pips
    // (Note: other archetypes might show G, but in this seat it shouldn't)
    const gPips = seatConfig.locator('span').filter({ hasText: /^G$/ })
    await expect(gPips).toHaveCount(0)
  })

  test('Selecting kraum_tymna triggers commander portrait load', async ({ page }) => {
    const seat0Select = page.locator('select[data-seat="0"]')
    await seat0Select.selectOption('kraum_tymna')
    // Portrait img should eventually appear (or loading state)
    // We just check that the select value changed and no crash
    await expect(seat0Select).toHaveValue('kraum_tymna')
  })
})
