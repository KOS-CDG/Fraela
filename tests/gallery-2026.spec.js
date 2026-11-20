import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const gallery = JSON.parse(readFileSync(new URL('../src/gallery-2026.json', import.meta.url)))
const total = gallery.photos.length

test('manifest covers every PDF page once, in order', () => {
  const pages = [...gallery.photos.map((p) => p.page), ...gallery.skipped.map((s) => s.page)].sort((a, b) => a - b)
  expect(pages).toEqual(Array.from({ length: gallery.pages }, (_, i) => i + 1))
  const shown = gallery.photos.map((p) => p.page)
  expect(shown).toEqual([...shown].sort((a, b) => a - b))
  expect(gallery.photos.map((p) => p.n)).toEqual(Array.from({ length: total }, (_, i) => i + 1))
})

for (const motion of ['no-preference', 'reduce']) {
  test(`renders every photo once, in order (${motion} motion)`, async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.emulateMedia({ reducedMotion: motion })
    await page.goto('/2026/')
    const order = await page.locator('#memories .ph').evaluateAll((nodes) => nodes.map((n) => Number(n.dataset.n)))
    expect(order).toEqual(Array.from({ length: total }, (_, i) => i + 1))
    await expect(page.locator('.heart .tile')).toHaveCount(total)
    expect(errors).toEqual([])
  })
}

test('every photo file loads', async ({ request }) => {
  const missing = []
  for (const photo of gallery.photos) {
    for (const size of ['s', 'l']) {
      const response = await request.head(`/media/2026/gallery/${size}/${String(photo.n).padStart(4, '0')}.webp`)
      if (!response.ok()) missing.push(`${size}/${photo.n}`)
    }
  }
  expect(missing).toEqual([])
})

test('scrolling to the end reaches the last photo on a phone', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/2026/')
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 700) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(16)
  }
  await page.locator('.finale').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.ph[data-n="1"]').click()
  await expect(page.locator('.viewer')).toBeVisible()
  await expect(page.locator('.viewer-caption')).toHaveText(`001 / ${total}`)
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.viewer-caption')).toHaveText(`002 / ${total}`)
})
