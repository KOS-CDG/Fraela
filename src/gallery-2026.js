import { animate, createTimeline, onScroll, splitText, stagger, utils } from 'animejs'
import content from './gallery-2026.json'
import sizes from './gallery-2026-photos.json'
import { renderMonthly2026 } from './monthly-2026.js'
// Section colours, shared with the film in video/. Each section sets them as it reaches the middle of the screen.
import TONES from './gallery-2026-tones.json'

const PHOTOS = '../media/2026/photos/'
const FILM = '../media/2026/film/'
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const narrow = matchMedia('(max-width: 760px)').matches

const photos = content.chapters.flatMap((chapter) => chapter.photos.map((photo) => ({ ...photo, chapter })))
const byPage = new Map(photos.map((photo) => [photo.page, photo]))
const file = (page, size) => `${PHOTOS}${String(page).padStart(4, '0')}-${size}.webp`

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

function ratio(photo) {
  const { w, h } = sizes[photo.page]
  return `${w} / ${h}`
}

function frame(photo, sizesAttr, eager = false) {
  const { w, h } = sizes[photo.page]
  const img = element('img')
  img.src = file(photo.page, 's')
  img.srcset = `${file(photo.page, 's')} 640w, ${file(photo.page, 'l')} ${w}w`
  img.sizes = sizesAttr
  img.width = w
  img.height = h
  img.alt = photo.alt
  img.decoding = 'async'
  img.loading = eager ? 'eager' : 'lazy'
  const wrap = element('span', 'frame')
  wrap.style.setProperty('--ratio', ratio(photo))
  wrap.append(img)
  return wrap
}

function shot(photo, sizesAttr) {
  const item = element('li', 'shot')
  item.style.setProperty('--ratio', ratio(photo))
  const body = element('div', 'shot-body')
  const open = element('button', 'shot-open')
  open.type = 'button'
  open.setAttribute('aria-haspopup', 'dialog')
  open.append(frame(photo, sizesAttr))
  // Chapters hold the plain photo objects, so find the viewer's copy by page number.
  const index = photos.findIndex(({ page }) => page === photo.page)
  open.addEventListener('click', () => openViewer(index))
  body.append(open, element('p', 'shot-caption', photo.caption))
  item.append(body)
  return item
}

function chapterHead(chapter) {
  const head = element('header', 'chapter-head')
  const numeral = element('p', 'chapter-numeral', chapter.numeral)
  numeral.setAttribute('aria-hidden', 'true')
  const title = element('h2', '', chapter.title)
  title.id = `${chapter.id}-title`
  head.append(numeral, title, element('p', 'chapter-message', chapter.message))
  return head
}

function renderHero() {
  const hero = element('section', 'hero')
  hero.dataset.tone = 'night'
  hero.setAttribute('aria-labelledby', 'gallery-title')
  const stage = element('div', 'hero-stage')
  const layers = [
    ['back', 0.35, '(max-width: 760px) 34vw, 19vw'],
    ['main', 0.6, '(max-width: 760px) 56vw, 31vw'],
    ['front', 1, '(max-width: 760px) 35vw, 18vw'],
  ]
  content.hero.forEach((page, index) => {
    const [name, depth, sizesAttr] = layers[index]
    const figure = element('figure', `hero-photo hero-photo-${name}`)
    figure.dataset.depth = depth
    figure.append(frame(byPage.get(page), sizesAttr, true))
    stage.append(figure)
  })
  const title = element('h1', 'hero-title')
  title.id = 'gallery-title'
  title.append(element('span', 'name', content.title), element('span', 'year', content.year))
  stage.append(title)

  const foot = element('div', 'hero-foot')
  const index = element('ol', 'chapter-index')
  index.setAttribute('aria-label', 'Chapters')
  for (const chapter of content.chapters) {
    const link = element('a')
    link.href = `#${chapter.id}`
    link.append(element('span', '', chapter.numeral), document.createTextNode(chapter.title))
    const item = element('li')
    item.append(link)
    index.append(item)
  }
  const film = element('li')
  const filmLink = element('a')
  filmLink.href = '#film'
  filmLink.append(element('span'), document.createTextNode(content.film.title))
  film.append(filmLink)
  index.append(film)
  const dedication = element('div', 'hero-letter')
  dedication.append(
    element('p', 'hero-dedication', content.dedication),
    element('p', 'hero-intro', content.intro),
  )
  foot.append(dedication, index)
  hero.append(stage, foot)
  return hero
}

function renderChapter(chapter) {
  const section = element('section', `chapter chapter-${chapter.layout}`)
  section.id = chapter.id
  section.dataset.tone = chapter.id
  section.setAttribute('aria-labelledby', `${chapter.id}-title`)
  if (chapter.layout === 'reel') {
    const reel = element('div', 'reel')
    const sticky = element('div', 'reel-sticky')
    const track = element('div', 'reel-track')
    const list = element('ol', 'reel-shots')
    for (const photo of chapter.photos) list.append(shot(photo, '(max-width: 760px) 78vw, 36vw'))
    track.append(chapterHead(chapter), list)
    sticky.append(track)
    reel.append(sticky)
    section.append(reel)
  } else {
    const list = element('ol', 'collage')
    for (const photo of chapter.photos) list.append(shot(photo, '(max-width: 760px) 80vw, 46vw'))
    section.append(chapterHead(chapter), list)
  }
  return section
}

function renderFilm() {
  const section = element('section', 'film')
  section.id = 'film'
  section.dataset.tone = 'film'
  section.setAttribute('aria-labelledby', 'film-title')
  const text = element('div', 'film-text')
  const title = element('h2', '', content.film.title)
  title.id = 'film-title'
  const note = element('p', '', content.film.note)
  const actions = element('div', 'film-actions')
  const holder = element('div', 'film-frame')
  const video = element('video')
  video.controls = true
  video.defaultMuted = true
  video.muted = true
  video.loop = true
  video.playsInline = true
  video.preload = 'metadata'
  video.poster = `${FILM}${content.film.poster}`
  video.setAttribute('aria-label', 'Film of the 2026 photographs with music')
  const source = element('source')
  source.src = `${FILM}${content.film.src}`
  source.type = 'video/mp4'
  video.append(source)

  const sound = element('button', 'film-sound', 'Play with sound')
  const fullscreen = element('button', 'film-fullscreen', 'Full screen')
  for (const button of [sound, fullscreen]) button.type = 'button'
  fullscreen.setAttribute('aria-haspopup', 'dialog')
  actions.append(sound, fullscreen)

  const dialog = element('dialog', 'film-player')
  dialog.setAttribute('aria-label', '2026 film player')
  const surface = element('div', 'film-player-surface')
  const controls = element('div', 'film-player-controls')
  const close = element('button', '', 'Close')
  close.setAttribute('aria-label', 'Close film player')
  close.autofocus = true
  const audio = element('button', '', 'Sound on')
  audio.setAttribute('aria-label', 'Turn on film sound')
  const fill = element('button', 'film-player-fill', 'Fill screen')
  fill.setAttribute('aria-pressed', 'false')
  const native = element('button', '', 'Full screen')
  native.setAttribute('aria-label', 'Enter native full screen')
  const play = element('button', 'film-player-play', 'Play film')
  for (const button of [close, audio, fill, native, play]) button.type = 'button'
  native.hidden = !document.fullscreenEnabled && !video.webkitEnterFullscreen
  play.hidden = true
  controls.append(close, audio, fill, native)
  surface.append(controls, play)
  dialog.append(surface)

  let nativeActive = false
  let canAutoOpen = true

  function startFilm() {
    video.play().catch(() => {
      if (dialog.open && video.paused) play.hidden = false
    })
  }

  function requestNativeFullscreen() {
    if (document.fullscreenEnabled && surface.requestFullscreen) {
      surface.requestFullscreen().catch(() => {})
    } else if (video.webkitEnterFullscreen) {
      try { video.webkitEnterFullscreen() } catch {}
    }
  }

  function openPlayer(requestNative = false) {
    if (dialog.open) return
    canAutoOpen = false
    play.hidden = true
    surface.prepend(video)
    dialog.showModal()
    document.documentElement.classList.add('film-player-open')
    if (requestNative) requestNativeFullscreen()
    startFilm()
  }

  fullscreen.addEventListener('click', () => openPlayer(true))
  native.addEventListener('click', requestNativeFullscreen)
  close.addEventListener('click', () => dialog.close())
  play.addEventListener('click', startFilm)
  fill.addEventListener('click', () => {
    const filled = surface.classList.toggle('film-player-filled')
    fill.setAttribute('aria-pressed', String(filled))
  })
  sound.addEventListener('click', () => {
    video.muted = false
    video.currentTime = 0
    startFilm()
  })
  audio.addEventListener('click', () => {
    video.muted = !video.muted
    if (video.paused) startFilm()
  })
  video.addEventListener('volumechange', () => {
    sound.hidden = !video.muted
    audio.textContent = video.muted ? 'Sound on' : 'Mute'
    audio.setAttribute('aria-label', video.muted ? 'Turn on film sound' : 'Mute film')
  })
  video.addEventListener('playing', () => { play.hidden = true })
  dialog.addEventListener('close', () => {
    video.pause()
    if (document.fullscreenElement === surface) document.exitFullscreen().catch(() => {})
    holder.append(video)
    document.documentElement.classList.remove('film-player-open')
  })
  document.addEventListener('fullscreenchange', () => {
    const isNative = document.fullscreenElement === surface
    native.hidden = isNative || (!document.fullscreenEnabled && !video.webkitEnterFullscreen)
    if (nativeActive && !isNative && dialog.open) dialog.close()
    nativeActive = isNative
  })
  video.addEventListener('webkitendfullscreen', () => {
    if (dialog.open) dialog.close()
  })

  const observer = new IntersectionObserver(([entry]) => {
    if (dialog.open || document.fullscreenElement === video || video.webkitDisplayingFullscreen) return

    if (entry.intersectionRatio < 0.5) {
      video.pause()
    } else if (!reduceMotion && canAutoOpen && !document.querySelector('dialog[open]')) {
      openPlayer()
    }
  }, { threshold: 0.5 })
  observer.observe(holder)

  holder.append(video)
  text.append(title, note, actions)
  section.append(text, holder, dialog)
  return section
}

function renderClosing() {
  const section = element('section', 'closing')
  section.dataset.tone = 'closing'
  section.setAttribute('aria-labelledby', 'closing-title')
  const title = element('h2', 'closing-title', content.closing.title)
  title.id = 'closing-title'
  const links = element('nav', 'closing-links')
  links.setAttribute('aria-label', 'After the gallery')
  const years = element('a')
  years.href = '../'
  years.append(element('span', 'arrow'), document.createTextNode(' All years'))
  years.firstChild.setAttribute('aria-hidden', 'true')
  const archive = element('a', '', 'Archive')
  archive.href = '../archive/'
  const top = element('button', '', 'Back to top')
  top.type = 'button'
  top.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    document.querySelector('.story-links a')?.focus({ preventScroll: true })
  })
  links.append(years, archive, top)
  section.append(
    title,
    element('p', 'closing-message', content.closing.message),
    element('p', 'closing-signoff', content.closing.signoff),
    links,
  )
  return section
}

// Photo viewer
const viewer = document.getElementById('viewer')
const viewerImage = document.getElementById('viewer-image')
let current = 0

function showPhoto(index) {
  current = (index + photos.length) % photos.length
  const photo = photos[current]
  const { w, h } = sizes[photo.page]
  viewerImage.src = file(photo.page, 'l')
  viewerImage.width = w
  viewerImage.height = h
  viewerImage.alt = photo.alt
  document.getElementById('viewer-chapter').textContent = photo.chapter.title
  document.getElementById('viewer-text').textContent = photo.caption
  document.getElementById('viewer-count').textContent = `${current + 1} of ${photos.length}`
  if (!reduceMotion) animate(viewerImage, { opacity: [0, 1], scale: [0.97, 1], duration: 420, ease: 'out(3)' })
}

function openViewer(index) {
  showPhoto(index)
  document.documentElement.classList.add('viewer-open')
  viewer.showModal()
}

document.getElementById('viewer-prev').addEventListener('click', () => showPhoto(current - 1))
document.getElementById('viewer-next').addEventListener('click', () => showPhoto(current + 1))
document.getElementById('viewer-close').addEventListener('click', () => viewer.close())
viewer.addEventListener('close', () => document.documentElement.classList.remove('viewer-open'))
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(current - 1)
  if (event.key === 'ArrowRight') showPhoto(current + 1)
})
let swipeStart = null
viewerImage.addEventListener('pointerdown', (event) => { swipeStart = event.clientX })
viewerImage.addEventListener('pointerup', (event) => {
  if (swipeStart === null) return
  const distance = event.clientX - swipeStart
  swipeStart = null
  if (Math.abs(distance) > 50) showPhoto(current + (distance < 0 ? 1 : -1))
})

// Build the page
const main = document.getElementById('gallery')
main.replaceChildren(
  renderHero(),
  renderMonthly2026(),
  ...content.chapters.map(renderChapter),
  renderFilm(),
  renderClosing(),
)

// Colours follow the section in the middle of the screen.
const root = document.documentElement
const themeColor = document.querySelector('meta[name="theme-color"]')
let activeTone = 'night'
function setTone(name) {
  const tone = TONES[name]
  if (!tone || name === activeTone) return
  activeTone = name
  root.dataset.tone = name
  themeColor.content = tone.bg
  const values = { '--bg': tone.bg, '--ink': tone.ink, '--accent': tone.accent }
  if (reduceMotion) utils.set(root, values)
  else animate(root, { ...values, duration: 900, ease: 'out(3)' })
}
for (const section of main.querySelectorAll('[data-tone]')) {
  onScroll({
    target: section,
    enter: 'center top',
    leave: 'center bottom',
    onEnter: () => setTone(section.dataset.tone),
  })
}

if (!reduceMotion) {
  const scrub = (target, params = {}) => onScroll({ target, sync: true, ...params })

  // Opening: the name rises out of its line while the photos settle.
  const hero = main.querySelector('.hero')
  const name = hero.querySelector('.name')
  const letters = splitText(name, { chars: { wrap: 'clip' } }).chars
  const heroFrames = hero.querySelectorAll('.hero-photo .frame')
  const heroText = hero.querySelectorAll('.year, .hero-letter, .chapter-index')
  utils.set(letters, { translateY: '105%' })
  utils.set(heroFrames, { opacity: 0, scale: 1.08 })
  utils.set(heroText, { opacity: 0, translateY: '0.75rem' })
  createTimeline({ defaults: { ease: 'out(4)', duration: 1300 } })
    .add(heroFrames, { opacity: 1, scale: 1, delay: stagger(170) }, 0)
    .add(letters, { translateY: '0%', delay: stagger(60) }, 250)
    .add(heroText, { opacity: 1, translateY: '0rem', delay: stagger(120) }, 900)

  // Hero layers drift apart at different depths as the page scrolls.
  for (const figure of hero.querySelectorAll('.hero-photo')) {
    const depth = Number(figure.dataset.depth)
    animate(figure, {
      translateY: ['0vh', `${-depth * 34}vh`],
      ease: 'linear',
      autoplay: scrub(hero, { enter: 'top top', leave: 'top bottom' }),
    })
  }
  animate(hero.querySelector('.hero-title'), {
    translateY: ['0vh', '-12vh'],
    opacity: [1, 0.25],
    ease: 'linear',
    autoplay: scrub(hero, { enter: 'top top', leave: 'top bottom' }),
  })

  // Chapter numerals pass behind the titles faster than the page.
  for (const head of main.querySelectorAll('.chapter-collage .chapter-head')) {
    animate(head.querySelector('.chapter-numeral'), {
      translateY: ['22vh', '-22vh'],
      ease: 'linear',
      autoplay: scrub(head),
    })
  }

  // Collage: photos move at alternating speeds and each picture slides inside its frame.
  const speeds = [0.5, 1.15, 0.8, 0.35]
  for (const list of main.querySelectorAll('.collage')) {
    list.querySelectorAll('.shot').forEach((item, index) => {
      const speed = speeds[index % speeds.length] * (narrow ? 0.5 : 1)
      animate(item.querySelector('.shot-body'), {
        translateY: [`${speed * 12}vh`, `${-speed * 12}vh`],
        ease: 'linear',
        autoplay: scrub(item),
      })
      animate(item.querySelector('img'), {
        translateY: ['-6.5%', '6.5%'],
        ease: 'linear',
        autoplay: scrub(item),
      })
    })
  }

  // Golden night: the section holds still while the photos glide sideways.
  const reel = main.querySelector('.reel')
  if (reel) {
    const track = reel.querySelector('.reel-track')
    const distance = () => Math.max(0, track.scrollWidth - innerWidth)
    const size = () => { reel.style.height = `${distance() + innerHeight}px` }
    size()
    const glide = animate(track, {
      translateX: [0, () => -distance()],
      ease: 'linear',
      autoplay: scrub(reel, { enter: 'top top', leave: 'bottom bottom' }),
    })
    for (const img of track.querySelectorAll('img')) {
      animate(img, {
        translateX: ['5%', '-5%'],
        ease: 'linear',
        autoplay: scrub(reel, { enter: 'top top', leave: 'bottom bottom' }),
      })
    }
    let resizeTimer
    addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { size(); glide.refresh() }, 150)
    })
  }

  // Closing letter: words brighten in reading order as it scrolls into place.
  const letter = main.querySelector('.closing-message')
  const words = splitText(letter, { words: true }).words
  animate(words, {
    opacity: [0.16, 1],
    delay: stagger(60),
    duration: 400,
    ease: 'linear',
    autoplay: scrub(letter, { enter: 'end start', leave: 'center center' }),
  })
}
