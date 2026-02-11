import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Deep Linking', () => {
  test('URL hash opens correct control', async ({ page }) => {
    await page.goto('./')

    // Upload catalog first
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'minimal-catalog.json'))
    await expect(page.locator('.catalog-view')).toBeVisible()

    // Navigate to hash
    await page.evaluate(() => { location.hash = '#/catalog/ac-2' })

    // Wait for control to be highlighted/visible
    await expect(page.getByText('Account Management')).toBeVisible()
  })
})
