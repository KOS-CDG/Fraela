import { devices, expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const archive = JSON.parse(readFileSync(new URL('../src/creativity-archive.json', import.meta.url)))
const creativity = '/archive/?folder=creativity'
const monthUrl = (month) => `${creativity}&month=${month}`
const expected = [
  ['2025-11', 9], ['2025-12', 150], ['2026-01', 37], ['2026-02', 152],
  ['2026-03', 48], ['2026-04', 80], ['2026-05', 157], ['2026-06', 118],
  ['2026-07', 36], ['2026-08', 26], ['2026-09', 27], ['2026-10', 14], ['2026-11', 103],
]

test('every dated export entry has a unique slot in the archive', () => {
  expect(archive).toHaveLength(957)
  expect(archive.map(({ id }) => Number(id))).toEqual(Array.from({ length: 957 }, (_, i) => i + 1))
  expect(archive.map(({ timestamp }) => timestamp)).toEqual(archive.map(({ timestamp }) => timestamp).sort())
  const counts = expected.map(([month]) => [month, archive.filter(({ timestamp }) => timestamp.startsWith(month)).length])
  expect(counts).toEqual(expected)
  expect(archive.filter(({ kind }) => kind === 'video')).toEqual([
    { id: '0825', kind: 'video', timestamp: '2026-09-05T22:35:02', preview: '2026-09/0825.mp4' },
  ])
})

test('all generated media URLs serve the expected types', async ({ request }) => {
  test.setTimeout(120_000)
  const files = archive.flatMap(({ thumb, preview }) => thumb ? [thumb, preview] : [preview])
  for (let i = 0; i < files.length; i += 16) {
    await Promise.all(files.slice(i, i + 16).map(async (file) => {
      const response = await request.head(`/media/creativity/${file}`)
      expect(response.status(), file).toBe(200)
      const type = file.endsWith('.mp4') ? 'video/mp4' : 'image/webp'
      expect(response.headers()['content-type'], file).toContain(type)
      await response.dispose()
    }))
  }
})

test('home and both year pages lead to the archive', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /2025, the birthday archive/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /2026, our memories/ })).toBeVisible()
  await page.getByRole('link', { name: 'Archive', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Archive', exact: true })).toBeVisible()
  const content = page.getByRole('main')
  await expect(content.locator('img')).toHaveCount(0)
  await content.getByRole('link', { name: /Creativity/ }).click()
  await expect(content.getByRole('heading', { name: 'Creativity' })).toBeVisible()
  await expect(content.getByRole('link')).toHaveCount(13)
  await expect(content.locator('img')).toHaveCount(0)
  await content.getByRole('link', { name: /November/ }).first().click()
  await expect(page).toHaveURL(monthUrl('2025-11'))
  await expect(content.getByRole('heading', { name: 'November 2025' })).toBeVisible()
  await page.goBack()
  await expect(content.getByRole('heading', { name: 'Creativity' })).toBeVisible()
  await page.goForward()
  await expect(content.getByRole('heading', { name: 'November 2025' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Folder location' }).getByRole('link', { name: 'Creativity' }).click()
  await expect(page).toHaveURL(creativity)

  for (const year of ['2025', '2026']) {
    const response = await page.goto(`/${year}/`)
    expect(response.ok()).toBe(true)
    // 2026 also links to the archive again at the end of the page.
    await page.getByRole('link', { name: 'Archive', exact: true }).first().click()
    await expect(page).toHaveURL('/archive/')
  }
})

test('month links render source timestamps without timezone conversion and the viewer follows phone order', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(monthUrl('2025-11'))
  const files = page.getByRole('list', { name: 'November 2025 files' })
  await expect(files.getByRole('button')).toHaveCount(9)
  const stamps = await files.locator('time').evaluateAll((nodes) => nodes.map((node) => node.dateTime))
  expect(stamps).toEqual(archive.slice(0, 9).map(({ timestamp }) => timestamp))
  const firstInBurst = files.getByRole('button', { name: /Photo 0005, 25 Nov 2025, 10:58:39/ })
  await firstInBurst.click()
  const dialog = page.getByRole('dialog', { name: 'Photo 0005' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.locator('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('dialog', { name: 'Photo 0006' }).locator('time')).toHaveAttribute('datetime', stamps[4])
  await page.getByRole('button', { name: /Previous/ }).click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(firstInBurst).toBeFocused()
})

test('each folder renders its month and only requests its thumbnails until opening a file', async ({ page }) => {
  test.setTimeout(90_000)
  const mediaRequests = []
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith('/media/creativity/')) mediaRequests.push(path)
  })
  for (const [key, count] of expected) {
    await page.goto(monthUrl(key))
    const title = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${key}-01T00:00:00Z`))
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    const files = page.getByRole('list', { name: `${title} files` })
    await expect(files.getByRole('button')).toHaveCount(count)
    const stamps = await files.locator('time').evaluateAll((times) => times.map((time) => time.dateTime))
    expect(stamps).toEqual(archive.filter(({ timestamp }) => timestamp.startsWith(key)).map(({ timestamp }) => timestamp))
    const thumbs = await files.locator('img').evaluateAll((images) => images.map((image) => new URL(image.src).pathname))
    expect(thumbs.every((path) => path.startsWith(`/media/creativity/${key}/`))).toBe(true)
  }
  expect(mediaRequests.length).toBeGreaterThan(0)
  expect(mediaRequests.every((path) => path.endsWith('-thumb.webp'))).toBe(true)
  const first = archive.find(({ timestamp }) => timestamp.startsWith('2026-11'))
  const preview = page.waitForResponse((response) => response.url().endsWith(first.preview))
  await page.getByRole('button', { name: new RegExp(`Photo ${first.id}`) }).click()
  expect((await preview).ok()).toBe(true)
})

test('an item from another month leaves the requested folder open', async ({ page }) => {
  await page.goto(`${monthUrl('2026-04')}&item=0338`)
  await expect(page.getByRole('heading', { name: 'April 2026', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('unavailable months link back to Creativity', async ({ page }) => {
  await page.goto(monthUrl('2040-01'))
  await expect(page.getByRole('heading', { name: 'Month not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to Creativity' }).click()
  await expect(page).toHaveURL(creativity)
})

test.describe('phone', () => {
  const { defaultBrowserType, ...phone } = devices['iPhone 13']
  test.use({ ...phone, timezoneId: 'America/Los_Angeles' })

  test('month picker and timestamped September video work on a phone', async ({ page }) => {
    await page.goto(creativity)
    await expect(page.getByRole('navigation', { name: 'Folders', exact: true })).toBeHidden()
    await page.getByRole('combobox', { name: 'Go to month' }).selectOption('2026-09')
    await expect(page).toHaveURL(monthUrl('2026-09'))
    await expect(page.getByRole('heading', { name: 'September 2026' })).toBeVisible()
    const files = page.getByRole('list', { name: 'September 2026 files' })
    await expect(files.getByRole('button')).toHaveCount(27)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(phone.viewport.width)
    await files.getByRole('button', { name: /Video 0825, 5 Sept 2026, 22:35:02/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Video 0825' })
    const clip = dialog.locator('video')
    await expect(clip).toHaveAttribute('controls', '')
    await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-09-05T22:35:02')
    await clip.evaluate(async (video) => {
      video.muted = true
      await video.play()
    })
    await expect.poll(() => clip.evaluate((video) => video.currentTime)).toBeGreaterThan(0)
    await dialog.getByRole('button', { name: 'Close viewer' }).click()
    await expect(clip).toHaveCount(0)
  })
})
