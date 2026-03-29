import { test, expect } from '@playwright/test'

test.describe('Settings Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('drawer opens on gear icon click', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    await expect(page.getByText('Settings').first()).toBeVisible()
  })

  test('drawer closes on ESC', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    await expect(page.getByText('Settings').first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Interaction Mode')).not.toBeVisible()
  })

  test('drawer closes on backdrop click', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    await expect(page.getByText('Settings').first()).toBeVisible()
    // Click the backdrop (outside the drawer panel)
    await page.click('[data-backdrop="true"]', { position: { x: 10, y: 10 } })
    await expect(page.getByText('Interaction Mode')).not.toBeVisible()
  })

  test('Stax Meta profile updates Auto seats to stax archetypes', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    // Click Stax Meta profile card
    await page.getByText('Stax Meta').click()
    // Seat 1 select should show Sisay
    const seat0Select = page.locator('[data-seat="0"]').nth(1)
    // The effective archetype in auto mode for stax should be sisay
    await expect(page.getByText('Sisay, Weatherlight Captain').first()).toBeVisible()
  })

  test('Pinned Seat 1 unchanged after meta profile switch', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    // Pin seat index 1 to kinnan
    const seat1Select = page.locator('select[data-seat="1"]')
    await seat1Select.selectOption('kinnan')
    // Switch meta profile
    await page.getByText('Turbo Meta').click()
    // Seat 1 should still show kinnan
    await expect(seat1Select).toHaveValue('kinnan')
  })

  test('Disabling star background removes canvas from DOM', async ({ page }) => {
    // Canvas is initially visible (starBackground = true)
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    await page.click('[aria-label="Open settings"]')
    // Toggle star background off
    await page.click('[data-testid="toggle-stars"]')
    await page.keyboard.press('Escape')

    // Canvas should now be hidden (v-show=false)
    await expect(canvas).not.toBeVisible()
  })

  test('Reduced motion toggle adds .reduced-motion to <html>', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    // Check current state; if it's already on (due to system pref), turn it off first
    const html = page.locator('html')
    const hadClass = await html.evaluate(el => el.classList.contains('reduced-motion'))

    const toggle = page.locator('[data-testid="toggle-reduced-motion"]')
    await toggle.click()

    if (hadClass) {
      await expect(html).not.toHaveClass(/reduced-motion/)
    } else {
      await expect(html).toHaveClass(/reduced-motion/)
    }
  })

  test('Seed displayed matches 8-digit hex format', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    const seedInput = page.locator('[data-testid="seed-input"]')
    const value = await seedInput.inputValue()
    expect(value).toMatch(/^[0-9a-f]{8}$/)
  })

  test('Reroll changes displayed seed', async ({ page }) => {
    await page.click('[aria-label="Open settings"]')
    const seedInput = page.locator('[data-testid="seed-input"]')
    const before = await seedInput.inputValue()

    let changed = false
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="seed-reroll"]')
      const after = await seedInput.inputValue()
      if (after !== before) { changed = true; break }
    }
    expect(changed).toBe(true)
  })
})
