import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('File Upload', () => {
  test('uploads JSON catalog via file input and renders controls', async ({ page }) => {
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'minimal-catalog.json'))

    // Catalog view should appear with group titles
    await expect(page.locator('.catalog-view')).toBeVisible()
    await expect(page.getByText('Access Control')).toBeVisible()
    await expect(page.getByText('Audit and Accountability')).toBeVisible()
  })

  test('shows error for invalid JSON file', async ({ page }) => {
    await page.goto('/')

    // Create a temporary invalid file by using the file chooser
    const fileInput = page.locator('input[type="file"]')

    // Upload the eslint config (not valid OSCAL)
    await fileInput.setInputFiles(path.join(__dirname, '..', 'playwright.config.ts'))

    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })
})
