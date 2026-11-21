import { expect, test } from '@playwright/test'

test('2026 has site navigation and no story content or media', async ({ page, request }) => {
  await page.goto('/2026/')
  await expect(page.getByRole('main', { name: '2026' })).toBeEmpty()
  await expect(page.locator('script')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'All years' })).toHaveAttribute('href', '../')
  await expect(page.getByRole('link', { name: 'Archive' })).toHaveAttribute('href', '../archive/')
  const formerGalleryPhoto = await request.head('/media/2026/gallery/s/0001.webp', {
    headers: { Accept: 'image/webp' },
  })
  expect(formerGalleryPhoto.status()).toBe(404)
})
