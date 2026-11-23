import { expect, test } from '@playwright/test'

const track = '/media/the-art-of-chasing-you.mp3'
const soundtrack = (page) => page.locator('#site-soundtrack')
const isPaused = (media) => media.evaluate((element) => element.paused)
const currentTime = (media) => media.evaluate((element) => element.currentTime)
const soundtrackTest = test.extend({
  autoplayPolicy: ['user-gesture-required', { option: true }],
  audioPage: async ({ autoplayPolicy, baseURL, playwright }, use) => {
    const browser = await playwright.chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: [`--autoplay-policy=${autoplayPolicy}`],
    })
    try {
      await use(await browser.newPage({ baseURL }))
    } finally {
      await browser.close()
    }
  },
})

test('the site serves the soundtrack as an MP3', async ({ request }) => {
  const response = await request.head(track)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('audio/mpeg')
})

soundtrackTest.describe('with gesture-gated autoplay', () => {
  soundtrackTest('the soundtrack starts on the first trusted interaction after autoplay is blocked', async ({ audioPage: page }) => {
    await page.goto('/')
    const audio = soundtrack(page)
    await expect(page.getByRole('button', { name: 'Play soundtrack' })).toBeVisible()
    expect(await isPaused(audio)).toBe(true)

    await page.getByRole('heading', { level: 1 }).click()
    await expect(page.getByRole('button', { name: 'Pause soundtrack' })).toBeVisible()
    await expect.poll(() => currentTime(audio)).toBeGreaterThan(0)
  })
})

soundtrackTest.describe('with autoplay allowed', () => {
  soundtrackTest.use({ autoplayPolicy: 'no-user-gesture-required' })

  soundtrackTest('the soundtrack keeps its place, yields to video and respects an explicit pause across pages', async ({ audioPage: page }) => {
    await page.goto('/')
    const audio = soundtrack(page)
    await expect.poll(() => currentTime(audio)).toBeGreaterThan(0)
    await audio.evaluate((element) => { element.currentTime = 10 })

    await page.goto('/archive/?folder=creativity&month=2026-09')
    await expect.poll(() => currentTime(audio)).toBeGreaterThanOrEqual(9)
    await page.getByRole('button', { name: /Video 0825/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Video 0825' })
    const video = dialog.locator('video')
    await video.evaluate(async (element) => {
      element.muted = true
      await element.play()
    })
    await expect.poll(() => isPaused(audio)).toBe(true)
    await expect(page.locator('.site-soundtrack-control')).toHaveAccessibleName('Turn off soundtrack')

    await dialog.getByRole('button', { name: 'Close viewer' }).click()
    await expect.poll(() => isPaused(audio)).toBe(false)
    await page.getByRole('button', { name: 'Pause soundtrack' }).click()

    await page.goto('/2026/')
    await expect(audio).toHaveAttribute('src', new URL(track, page.url()).href)
    await expect(page.getByRole('button', { name: 'Play soundtrack' })).toBeVisible()
    expect(await isPaused(audio)).toBe(true)
    await page.getByRole('button', { name: 'Play soundtrack' }).click()
    await expect.poll(() => isPaused(audio)).toBe(false)
  })
})
