import { expect, test } from '@playwright/test'

const filmPlayer = (page) => page.getByRole('dialog', { name: '2026 film player' })
const revealFilm = (page) => page.locator('#film .film-frame').evaluate((frame) => {
  frame.scrollIntoView({ block: 'center' })
})

async function expectViewportPlayer(dialog) {
  await expect(dialog).toBeVisible()
  const inViewport = await dialog.evaluate((element) => {
    const { top, left, width, height } = element.getBoundingClientRect()
    return Math.abs(top) <= 1 && Math.abs(left) <= 1
      && Math.abs(width - innerWidth) <= 1 && Math.abs(height - innerHeight) <= 1
  })
  expect(inViewport).toBe(true)
}

async function expectFittedPlayback(dialog) {
  await expectViewportPlayer(dialog)
  const video = dialog.locator('video')
  await expect(video).toHaveCSS('object-fit', 'contain')
  await expect(video).toHaveJSProperty('muted', true)
  await expect(video).toHaveJSProperty('playsInline', true)
  await expect.poll(() => video.evaluate((media) => media.currentTime)).toBeGreaterThan(0)
  return video
}

test('desktop opens the fitted film automatically and handles a declined native fullscreen request', async ({ page }) => {
  // A browser can decline native fullscreen. The site should still present its viewport player.
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = function () {
      window.fullscreenRequests = (window.fullscreenRequests ?? 0) + 1
      return Promise.reject(new DOMException('Fullscreen unavailable', 'NotAllowedError'))
    }
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/2026/')
  const film = page.locator('#film')
  const dialog = filmPlayer(page)
  await expect(dialog).toBeHidden()
  await revealFilm(page)
  await expectFittedPlayback(dialog)
  expect(await page.evaluate(() => window.fullscreenRequests ?? 0)).toBe(0)
  await expect(film.locator('video')).toHaveCount(1)

  await dialog.getByRole('button', { name: 'Close film player' }).click()
  await expect(dialog).toBeHidden()
  const inlineVideo = film.locator('.film-frame video')
  await expect(inlineVideo).toHaveJSProperty('paused', true)
  await expect(inlineVideo).toHaveCSS('object-fit', 'contain')

  const fullScreen = film.getByRole('button', { name: 'Full screen', exact: true })
  await fullScreen.click()
  await expectViewportPlayer(dialog)
  await expect.poll(() => page.evaluate(() => window.fullscreenRequests)).toBe(1)
  await expect(dialog.locator('video')).toHaveCSS('object-fit', 'contain')
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('the viewport player autoplays the full frame, supports optional fill and opens only once', async ({ page }) => {
    await page.goto('/2026/')
    const dialog = filmPlayer(page)
    await expect(dialog).toBeHidden()
    await revealFilm(page)

    const video = await expectFittedPlayback(dialog)
    const fillScreen = dialog.getByRole('button', { name: 'Fill screen', exact: true })
    await expect(fillScreen).toHaveAttribute('aria-pressed', 'false')
    await fillScreen.tap()
    await expect(fillScreen).toHaveAttribute('aria-pressed', 'true')
    await expect(video).toHaveCSS('object-fit', 'cover')
    await fillScreen.tap()
    await expect(fillScreen).toHaveAttribute('aria-pressed', 'false')
    await expect(video).toHaveCSS('object-fit', 'contain')

    await dialog.getByRole('button', { name: 'Close film player' }).tap()
    await expect(dialog).toBeHidden()
    await expect(page.locator('#film .film-frame video')).toHaveJSProperty('paused', true)

    // Leaving and re-entering the film after dismissing it should keep the gallery browsable.
    const monthly = page.getByRole('region', { name: 'Our year in photos' })
    await monthly.getByRole('button', { name: 'February', exact: true }).tap()
    await expect(monthly.getByRole('heading', { name: 'February', exact: true })).toBeVisible()
    await revealFilm(page)
    await expect(page.locator('#film .film-frame video')).toBeInViewport()
    await expect(dialog).toBeHidden()
  })

  test('reduced motion keeps the player inline until Full screen is chosen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/2026/')
    const film = page.locator('#film')
    const inlineVideo = film.locator('.film-frame video')
    await revealFilm(page)
    await expect(inlineVideo).toBeInViewport()
    await expect(inlineVideo).toHaveJSProperty('paused', true)
    await expect(filmPlayer(page)).toBeHidden()

    await film.getByRole('button', { name: 'Full screen', exact: true }).tap()
    await expectViewportPlayer(filmPlayer(page))
    await expect(filmPlayer(page).locator('video')).toHaveCSS('object-fit', 'contain')
  })
})

