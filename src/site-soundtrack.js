import './site-soundtrack.css'

const storageKey = 'fraela-soundtrack'
const siteBase = import.meta.env.BASE_URL === './' ? '../' : import.meta.env.BASE_URL
const siteRoot = new URL(siteBase, import.meta.url)

const audio = document.createElement('audio')
audio.id = 'site-soundtrack'
audio.hidden = true
audio.loop = true
audio.preload = 'metadata'
audio.volume = 0.4

const control = document.createElement('button')
control.className = 'site-soundtrack-control'
control.type = 'button'
control.title = 'The Art of Chasing You (feat. Ade Paloh)'
const icon = document.createElement('span')
icon.className = 'site-soundtrack-icon'
icon.textContent = '♫'
icon.setAttribute('aria-hidden', 'true')
const label = document.createElement('span')
control.append(icon, label)
document.body.append(audio, control)

let wanted = true
let suspended = false
let unavailable = false
let blocker

function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey))
    if (!saved) return
    wanted = saved.wanted !== false
    if (Number.isFinite(saved.position) && saved.position >= 0) {
      audio.currentTime = saved.position
    }
  } catch {
    // The soundtrack also works in tabs where storage is unavailable.
  }
}

function remember() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ wanted, position: audio.currentTime }))
  } catch {
    // Playback does not depend on storage access.
  }
}

function renderControl() {
  control.disabled = unavailable
  control.dataset.playing = String(!audio.paused)
  if (unavailable) {
    label.textContent = 'Music unavailable'
    control.setAttribute('aria-label', 'Soundtrack unavailable')
  } else if (blocker && wanted) {
    label.textContent = 'Music on hold'
    control.setAttribute('aria-label', 'Turn off soundtrack')
  } else if (!audio.paused) {
    label.textContent = 'Pause music'
    control.setAttribute('aria-label', 'Pause soundtrack')
  } else {
    label.textContent = 'Play music'
    control.setAttribute('aria-label', 'Play soundtrack')
  }
}

// A video can be closed or replaced in the same task that pauses it. The
// queued pause event then has no path to the document.
const mediaRemoval = new MutationObserver(() => {
  if (blocker && !blocker.isConnected) syncPlayback()
})

function syncPlayback() {
  blocker = Array.from(document.querySelectorAll('audio, video')).find(
    (media) => media !== audio && !media.paused && !media.ended,
  )
  if (blocker) mediaRemoval.observe(document.body, { childList: true, subtree: true })
  else mediaRemoval.disconnect()

  if (suspended || unavailable || !wanted || blocker) {
    audio.pause()
  } else if (audio.paused) {
    // Audible autoplay can be denied until the visitor interacts with the page.
    audio.play().catch(renderControl)
  }
  renderControl()
}

for (const type of ['play', 'playing', 'pause', 'ended', 'emptied', 'error']) {
  document.addEventListener(type, (event) => {
    if (event.target instanceof HTMLMediaElement && event.target !== audio) syncPlayback()
  }, true)
}

for (const type of ['play', 'playing', 'pause']) {
  audio.addEventListener(type, renderControl)
}
audio.addEventListener('error', () => {
  unavailable = true
  renderControl()
})

control.addEventListener('click', () => {
  wanted = audio.paused && !(blocker && wanted)
  remember()
  syncPlayback()
})

function unlock(event) {
  if (!event.isTrusted || control.contains(event.target) || !wanted || !audio.paused) return
  syncPlayback()
}

document.addEventListener('click', unlock)
document.addEventListener('pointerup', (event) => {
  if (event.pointerType !== 'mouse') unlock(event)
})
document.addEventListener('keydown', (event) => {
  if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) unlock(event)
})

window.addEventListener('pagehide', () => {
  suspended = true
  remember()
  audio.pause()
})
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return
  suspended = false
  restore()
  syncPlayback()
})

audio.src = new URL('media/the-art-of-chasing-you.mp3', siteRoot).href
restore()
syncPlayback()
