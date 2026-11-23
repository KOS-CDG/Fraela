import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const archive = JSON.parse(readFileSync(new URL('../src/creativity-archive.json', import.meta.url)))
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' })
const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})
const months = Array.from({ length: 12 }, (_, index) => {
  const key = `2026-${String(index + 1).padStart(2, '0')}`
  return {
    name: monthFormatter.format(new Date(`${key}-01T00:00:00Z`)),
    photos: archive.filter(({ kind, timestamp }) => kind === 'photo' && timestamp.startsWith(key)),
  }
})
const mediaSource = (photo) => `../media/creativity/${photo.preview}`
const dateLabel = (timestamp) => dateFormatter.format(new Date(`${timestamp}Z`))

// A different browser time zone must leave the export's local dates intact.
test.use({ timezoneId: 'Pacific/Kiritimati' })

test('all twelve months show their dated source photos or an empty album', async ({ page }) => {
  await page.goto('/2026/')
  const section = page.getByRole('region', { name: 'Our year in photos' })
  const monthPicker = section.getByRole('group', { name: 'Months of 2026' })
  const rail = section.getByRole('list', { name: 'Monthly highlights' })
  const total = months.reduce((count, { photos }) => count + photos.length, 0)

  await expect(monthPicker.getByRole('button')).toHaveCount(12)
  await expect(section.getByText(`${total} dated photos from 2026.`, { exact: false })).toBeVisible()

  for (const { name, photos } of months) {
    const month = monthPicker.getByRole('button', { name, exact: true })
    await month.click()
    await expect(monthPicker.getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(month).toHaveAttribute('aria-pressed', 'true')
    await expect(section.getByRole('heading', { name, exact: true })).toBeVisible()

    if (!photos.length) {
      await expect(section.getByText('There are no dated photos for this month yet.')).toBeVisible()
      await expect(rail).toBeHidden()
      await expect(section.getByRole('button', { name: /^View all/ })).toBeHidden()
      continue
    }

    await expect(section.getByRole('button', { name: `View all ${photos.length} photos` })).toBeVisible()
    const cards = await rail.getByRole('listitem').all()
    expect(cards.length, name).toBeGreaterThan(0)
    const sourceByPath = new Map(photos.map((photo) => [mediaSource(photo), photo]))
    for (const card of cards) {
      const source = sourceByPath.get(await card.locator('img').getAttribute('src'))
      expect(source, `Highlight should come from ${name}`).toBeDefined()
      await expect(card.locator('time')).toHaveAttribute('datetime', source.timestamp)
      await expect(card.locator('time')).toHaveText(dateLabel(source.timestamp))
    }
  }
})

test('the monthly viewer supports keyboard navigation, dragging and date jumps', async ({ page }) => {
  const { name, photos } = months[0]
  await page.goto('/2026/')
  const section = page.getByRole('region', { name: 'Our year in photos' })
  await section.getByRole('button', { name: `View all ${photos.length} photos` }).click()
  const viewer = page.getByRole('dialog', { name: `${name} 2026` })
  const image = viewer.getByRole('img')
  await expect(viewer).toBeVisible()
  await expect(image).toHaveAttribute('src', mediaSource(photos[0]))
  await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0)

  await page.keyboard.press('ArrowRight')
  await expect(image).toHaveAttribute('src', mediaSource(photos[1]))
  await expect(viewer.getByText(`2 of ${photos.length}`)).toBeVisible()

  const box = await viewer.locator('.monthly-viewer-viewport').boundingBox()
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(image).toHaveAttribute('src', mediaSource(photos[2]))

  const latestDay = photos.at(-1).timestamp.slice(0, 10)
  const firstOnLatestDay = photos.find((photo) => photo.timestamp.startsWith(latestDay))
  await viewer.getByLabel('Jump to date').selectOption(latestDay)
  await expect(image).toHaveAttribute('src', mediaSource(firstOnLatestDay))
  await expect(viewer.locator('time')).toHaveText(dateLabel(firstOnLatestDay.timestamp))

  await page.keyboard.press('Escape')
  await expect(viewer).toBeHidden()
})

test('the highlight rail pans photos during paging and preserves paging with reduced motion', async ({ page }) => {
  await page.goto('/2026/')
  const section = page.getByRole('region', { name: 'Our year in photos' })
  const rail = section.getByRole('list', { name: 'Monthly highlights' })
  const card = rail.getByRole('listitem').nth(1)
  const next = section.getByRole('button', { name: 'Next highlight' })
  const previous = section.getByRole('button', { name: 'Previous highlight' })
  const count = await rail.getByRole('listitem').count()
  const pan = () => card.evaluate((element) => element.style.getPropertyValue('--monthly-pan'))

  await expect(previous).toBeDisabled()
  await expect.poll(pan).toMatch(/^-\d/)
  const initialPan = await pan()
  await next.click()
  await expect(section.getByText(`Highlight 2 of ${count}`)).toBeVisible()
  await expect.poll(pan).not.toBe(initialPan)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(card.locator('img')).toHaveCSS('transform', 'none')
  await next.click()
  await expect(section.getByText(`Highlight 3 of ${count}`)).toBeVisible()
  await expect.poll(pan).toBe('0%')
})
