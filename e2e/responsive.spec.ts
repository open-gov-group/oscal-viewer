import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Responsive Layout', () => {
  const viewports = [
    { name: 'mobile', width: 320, height: 568 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ]

  for (const vp of viewports) {
    test(`renders correctly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')

      // Upload catalog
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'minimal-catalog.json'))
      await expect(page.locator('.catalog-view')).toBeVisible()

      // App header should always be visible
      await expect(page.locator('.app-header')).toBeVisible()

      // At mobile width, sidebar may be hidden
      if (vp.width < 768) {
        // Content should still be visible
        await expect(page.locator('.catalog-view')).toBeVisible()
      } else {
        // Sidebar should be visible on tablet+
        await expect(page.locator('.catalog-sidebar')).toBeVisible()
      }
    })
  }
})
