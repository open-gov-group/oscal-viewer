import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Search', () => {
  test('search filters controls by keyword', async ({ page }) => {
    await page.goto('./')

    // Upload catalog
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'minimal-catalog.json'))
    await expect(page.locator('.catalog-view')).toBeVisible()

    // Type in search bar
    const searchInput = page.locator('input[type="search"]')
    await searchInput.fill('Account')

    // Search results should appear
    await expect(page.locator('[role="listbox"]')).toBeVisible()
    await expect(page.getByText('Account Management')).toBeVisible()
  })
})
