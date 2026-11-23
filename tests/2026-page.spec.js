import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const content = JSON.parse(readFileSync(new URL('../src/gallery-2026.json', import.meta.url)))
const photos = content.chapters.flatMap((chapter) => chapter.photos.map((photo) => ({ ...photo, chapter })))
const pages = photos.map(({ page }) => page)

test('the 2026 content lists 25 distinct photos, each with a caption and a description', () => {
  expect(photos).toHaveLength(25)
  expect(new Set(pages).size).toBe(25)
  for (const page of content.hero) expect(pages).toContain(page)
  for (const chapter of content.chapters) expect(chapter.message.length, chapter.id).toBeGreaterThan(40)
  // The film sets these line by line, so each is a list of lines.
  for (const key of ['lockDates', 'notification', 'portrait', 'finale']) {
    expect(content.film[key].length, key).toBeGreaterThan(1)
  }
  expect(content.film.postcard.message.length).toBeGreaterThan(1)
  expect(content.film.postcard.to.length).toBeGreaterThan(1)
  for (const photo of photos) {
    expect(photo.caption, String(photo.page)).not.toBe('')
    expect(photo.alt, String(photo.page)).toContain('Fraela')
  }
})

test('2026 shows the hero, four chapters with their messages, the film and the birthday note', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto('/2026/')
  await expect(page.getByRole('link', { name: 'All years' }).first()).toHaveAttribute('href', '../')
  await expect(page.getByRole('link', { name: 'Archive' }).first()).toHaveAttribute('href', '../archive/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(content.title)
  await expect(page.getByText(content.intro)).toBeVisible()
  await expect(page.getByRole('list', { name: 'Chapters' }).getByRole('link')).toHaveCount(content.chapters.length + 1)

  for (const chapter of content.chapters) {
    const section = page.getByRole('region', { name: chapter.title })
    await expect(section).toBeAttached()
    await expect(section.getByText(chapter.message)).toBeAttached()
    await expect(section.getByRole('listitem')).toHaveCount(chapter.photos.length)
    for (const photo of chapter.photos) await expect(section.getByText(photo.caption, { exact: true })).toBeAttached()
  }

  const film = page.getByRole('region', { name: content.film.title })
  await expect(film.getByText(content.film.note)).toBeAttached()
  await expect(film.locator('video')).toHaveAttribute('poster', `../media/2026/film/${content.film.poster}`)
  await expect(film.locator('video source')).toHaveAttribute('src', `../media/2026/film/${content.film.src}`)
  await expect(film.getByRole('button', { name: 'Play with sound' })).toBeAttached()

  const closing = page.getByRole('region', { name: content.closing.title })
  await expect(closing.getByText(content.closing.message)).toBeAttached()
  await expect(closing.getByText(content.closing.signoff)).toBeAttached()
  expect(errors).toEqual([])
})

test('every photo in the hero and original chapters loads', async ({ page }) => {
  await page.goto('/2026/')
  const images = page.locator('.hero img, .chapter img')
  await expect(images).toHaveCount(photos.length + content.hero.length)
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((img) => img.naturalWidth), { message: await image.getAttribute('src') }).toBeGreaterThan(0)
  }
})

test('the viewer opens a photo, steps through all 25 and closes', async ({ page }) => {
  await page.goto('/2026/')
  const [first, second] = photos
  await page.getByRole('button', { name: first.alt }).click()
  const viewer = page.getByRole('dialog', { name: 'Photo viewer' })
  await expect(viewer).toBeVisible()
  await expect(viewer.getByRole('img')).toHaveAttribute('alt', first.alt)
  await expect(viewer.getByText(first.caption)).toBeVisible()
  await expect(viewer.getByText(`1 of ${photos.length}`)).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(viewer.getByRole('img')).toHaveAttribute('alt', second.alt)
  await expect(viewer.getByText(`2 of ${photos.length}`)).toBeVisible()
  await viewer.getByRole('button', { name: 'Previous' }).click()
  await viewer.getByRole('button', { name: 'Previous' }).click()
  await expect(viewer.getByText(`${photos.length} of ${photos.length}`)).toBeVisible()
  await expect(viewer.getByText(photos.at(-1).chapter.title)).toBeVisible()
  await expect.poll(() => viewer.getByRole('img').evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0)

  await viewer.getByRole('button', { name: 'Close' }).click()
  await expect(viewer).toBeHidden()
})

test('the film and its poster are served, and the film has music', async ({ request }) => {
  const film = await request.get(`/media/2026/film/${content.film.src}`)
  expect(film.status()).toBe(200)
  expect(film.headers()['content-type']).toContain('video/mp4')
  const bytes = await film.body()
  // An MP4 with sound carries an audio track handler ("soun") next to the video one ("vide").
  expect(bytes.includes(Buffer.from('vide'))).toBe(true)
  expect(bytes.includes(Buffer.from('soun'))).toBe(true)
  const poster = await request.head(`/media/2026/film/${content.film.poster}`)
  expect(poster.status()).toBe(200)
  expect(poster.headers()['content-type']).toContain('image/webp')
})

test('with reduced motion the page shows every chapter without scroll effects', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/2026/')
  for (const chapter of content.chapters) {
    const section = page.getByRole('region', { name: chapter.title })
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText(chapter.message)).toBeVisible()
  }
  const reel = page.locator('.reel-sticky')
  await expect(reel).toHaveCSS('position', 'static')
  await expect(reel).toHaveCSS('overflow-x', 'auto')
  await context.close()
})

test('the old 2026 gallery files are gone', async ({ request }) => {
  const formerGalleryPhoto = await request.head('/media/2026/gallery/s/0001.webp', {
    headers: { Accept: 'image/webp' },
  })
  expect(formerGalleryPhoto.status()).toBe(404)
})
