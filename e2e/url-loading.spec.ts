import { test, expect } from '@playwright/test'

test.describe('URL Loading', () => {
  test('preset button loads a document', async ({ page }) => {
    await page.goto('/')

    // Click the first preset button (NIST SP 800-53)
    const presetBtn = page.locator('.preset-btn').first()
    await expect(presetBtn).toBeVisible()
    await presetBtn.click()

    // Should show loading state then document view
    await expect(page.locator('.document-view')).toBeVisible({ timeout: 30000 })
  })

  test('?url= parameter loads document on page load', async ({ page }) => {
    // Use a small known catalog URL
    const url = 'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json'
    await page.goto(`/?url=${encodeURIComponent(url)}`)

    // Should show document view after loading
    await expect(page.locator('.document-view')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('.catalog-view')).toBeVisible()
  })
})
