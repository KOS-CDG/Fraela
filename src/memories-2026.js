// Film slots and the closing letter for the 2026 page.
// The photos come from src/gallery-2026.json (generated) and src/chapters-2026.js (titles).

const video = (id, aspect, tone) => ({
  id, type: 'video', src: '', poster: '', captions: '', label: '', aspect, focalPoint: '50% 50%', tone,
})

// Leave a source empty to keep its placeholder frame.
export const films = {
  id: 'films',
  title: '',
  caption: '',
  media: [video('V01', '9 / 16', 'purple'), video('V02', '16 / 9', 'plum'), video('V03', '16 / 9', 'plum')],
}

// Shown after the finale when filled in.
export const closingLetter = ''
