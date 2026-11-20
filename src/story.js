import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gallery from './gallery-2026.json'
import { chapters } from './chapters-2026.js'
import { films, closingLetter } from './memories-2026.js'
import './theme.css'
import './story.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const photos = gallery.photos
const TOTAL = photos.length
const MEDIA = '../media/2026/gallery/'
const EDGES = { s: 720, l: 1280 }
const BURST_CHANGE = 26 // a photo this close to the previous one belongs to the same burst
const BURST_MIN = 6
const BLOCK_MAX = 12
const FLIP_MAX = 24
const ROTATION = ['spread', 'columns', 'strip', 'scatter']
const THEMES = [
  ['lavender', 'plum'], ['plum', 'lavender'], ['pale-pink', 'plum'], ['mulberry', 'lavender'],
  ['lilac', 'plum'], ['purple', 'lavender'],
]

const root = document.documentElement
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const narrow = matchMedia('(max-width: 620px)').matches
const main = document.querySelector('#memories')
const token = (name) => getComputedStyle(root).getPropertyValue(`--${name}`).trim()
const pad = (n, size = 3) => String(n).padStart(size, '0')
const src = (n, size) => `${MEDIA}${size}/${pad(n, 4)}.webp`
const roman = (n) => [['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]]
  .reduce((out, [glyph, value]) => { while (n >= value) { out += glyph; n -= value } return out }, '')

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

function scaled(photo, size) {
  const scale = Math.min(1, EDGES[size] / Math.max(photo.w, photo.h))
  return Math.round(photo.w * scale)
}

/* ---------- Photos ---------- */

function photoButton(photo, { sizes = '(max-width: 620px) 92vw, 48vw', eager = false } = {}) {
  const button = element('button', 'ph')
  button.type = 'button'
  button.dataset.n = photo.n
  button.setAttribute('aria-label', `Open photo ${photo.n} of ${TOTAL}`)
  button.style.setProperty('--ar', `${photo.w} / ${photo.h}`)
  button.style.setProperty('--arn', (photo.w / photo.h).toFixed(4))
  button.style.setProperty('--c', photo.c)
  const image = new Image(photo.w, photo.h)
  image.alt = `2026 memory, photo ${photo.n} of ${TOTAL}`
  image.loading = eager ? 'eager' : 'lazy'
  image.decoding = 'async'
  image.sizes = sizes
  image.srcset = `${src(photo.n, 's')} ${scaled(photo, 's')}w, ${src(photo.n, 'l')} ${scaled(photo, 'l')}w`
  image.src = src(photo.n, 's')
  const loaded = () => button.classList.add('is-loaded')
  if (image.complete && image.naturalWidth) loaded()
  else image.addEventListener('load', loaded, { once: true })
  button.append(image)
  return button
}

/* ---------- Chapters and blocks ---------- */

function chapterRanges() {
  return chapters.map((chapter, index) => {
    const end = (chapters[index + 1]?.start ?? TOTAL + 1) - 1
    return { ...chapter, index, end, photos: photos.slice(chapter.start - 1, end) }
  })
}

// Split a chapter into blocks: long bursts of near-identical shots become flip-books,
// everything else is cut into blocks of at most BLOCK_MAX photos.
function splitBlocks(list) {
  const runs = []
  let run = [list[0]]
  for (const photo of list.slice(1)) {
    if (photo.d <= BURST_CHANGE) run.push(photo)
    else { runs.push(run); run = [photo] }
  }
  runs.push(run)

  const blocks = []
  let loose = []
  const flushLoose = () => {
    if (!loose.length) return
    const size = Math.ceil(loose.length / Math.ceil(loose.length / BLOCK_MAX))
    for (let i = 0; i < loose.length; i += size) blocks.push({ kind: 'loose', photos: loose.slice(i, i + size) })
    loose = []
  }
  for (const group of runs) {
    if (group.length >= BURST_MIN) {
      flushLoose()
      for (let i = 0; i < group.length; i += FLIP_MAX) {
        const part = group.slice(i, i + FLIP_MAX)
        if (part.length >= BURST_MIN) blocks.push({ kind: 'flip', photos: part })
        else blocks.at(-1).photos.push(...part)
      }
    } else {
      loose.push(...group)
    }
  }
  flushLoose()
  return blocks
}

let rotation = 0
function chooseLayout(block) {
  if (block.kind === 'flip') return 'flip'
  let layout = ROTATION[rotation++ % ROTATION.length]
  if (layout === 'strip' && block.photos.length < 4) layout = 'spread'
  if (layout === 'columns' && block.photos.length < 5) layout = 'spread'
  return layout
}

function rangeLabel(list) {
  const first = list[0].n
  const last = list.at(-1).n
  return first === last ? `Photo ${first}` : `Photos ${first} to ${last}`
}

const layouts = {
  spread(list) {
    const block = element('div', 'block block--spread')
    list.forEach((photo, i) => {
      const item = photoButton(photo, { sizes: '(max-width: 620px) 92vw, 60vw' })
      item.classList.add(`sp-${i % 6}`)
      block.append(item)
    })
    return block
  },
  columns(list) {
    // A real grid keeps reading order left to right; each column then drifts at its own speed.
    const block = element('div', 'block block--columns')
    const count = narrow ? 2 : 3
    list.forEach((photo, i) => {
      const item = photoButton(photo, { sizes: '(max-width: 620px) 46vw, 30vw' })
      item.dataset.col = i % count
      block.append(item)
    })
    return block
  },
  strip(list) {
    const block = element('div', 'block block--strip')
    block.append(element('p', 'strip-hint', rangeLabel(list)))
    const track = block.appendChild(element('div', 'strip-track'))
    list.forEach((photo) => track.append(photoButton(photo, { sizes: '(max-width: 620px) 70vw, 45vw' })))
    return block
  },
  scatter(list) {
    const block = element('div', 'block block--scatter')
    list.forEach((photo) => {
      const print = element('div', 'print')
      print.style.setProperty('--r', `${((photo.n * 37) % 13) - 6}deg`)
      const button = photoButton(photo, { sizes: '(max-width: 620px) 46vw, 20rem' })
      print.append(button)
      block.append(print)
    })
    return block
  },
  flip(list) {
    const block = element('div', 'block block--flip')
    const stage = block.appendChild(element('div', 'flip-stage'))
    const frames = stage.appendChild(element('div', 'flip-frames'))
    list.forEach((photo) => frames.append(photoButton(photo, { sizes: '(max-width: 620px) 92vw, 60vw' })))
    const meta = stage.appendChild(element('p', 'flip-meta'))
    meta.append(element('span', 'flip-now', `Photo ${list[0].n}`), element('span', 'flip-count', rangeLabel(list)))
    return block
  },
}

/* ---------- Page ---------- */

function makeHero() {
  const section = element('section', 'hero')
  section.dataset.theme = 'plum,lavender'
  const stage = section.appendChild(element('div', 'hero-stage'))
  const frame = stage.appendChild(element('div', 'hero-photo'))
  frame.append(photoButton(photos[0], { sizes: '100vw', eager: true }))
  stage.append(element('h1', 'story-year', '2026'))
  stage.append(element('p', 'hero-sub', `${TOTAL} moments, in order`))
  stage.append(element('p', 'scroll-cue', 'Scroll to begin'))
  return section
}

function makeChapterHead(chapter) {
  const head = element('header', 'chapter-head')
  head.append(element('p', 'chapter-kicker', 'Chapter'))
  head.append(element('p', 'chapter-num', roman(chapter.index + 1)))
  const title = element('h2', 'chapter-title')
  title.setAttribute('aria-label', chapter.title || `Chapter ${chapter.index + 1}`)
  for (const word of (chapter.title || `Chapter ${chapter.index + 1}`).split(' ')) {
    const wordNode = title.appendChild(element('span', 'word'))
    wordNode.setAttribute('aria-hidden', 'true')
    for (const char of word) wordNode.append(element('span', 'char', char))
    title.append(' ')
  }
  head.append(title)
  head.append(element('p', 'chapter-range', rangeLabel(chapter.photos)))
  return head
}

function makeChapter(chapter) {
  const section = element('section', 'chapter')
  section.id = `chapter-${chapter.index + 1}`
  section.setAttribute('aria-label', chapter.title || `Chapter ${chapter.index + 1}`)
  section.dataset.theme = THEMES[chapter.index % THEMES.length].join(',')
  section.append(makeChapterHead(chapter))
  const list = chapter.index === 0 ? chapter.photos.slice(1) : chapter.photos
  if (!list.length) return section
  for (const block of splitBlocks(list)) {
    const layout = chooseLayout(block)
    const node = layouts[layout](block.photos)
    node.dataset.layout = layout
    section.append(node)
  }
  return section
}

/* Film slots keep the page's original frame and playback behaviour. */
const playableVideos = []

function makeFrame(slot) {
  const figure = element('figure', 'memory-frame')
  figure.dataset.slot = slot.id
  figure.dataset.kind = slot.type
  figure.style.setProperty('--ratio', slot.aspect)
  figure.style.setProperty('--matte', `var(--${slot.tone})`)
  if (slot.poster) {
    const poster = new Image()
    poster.alt = ''
    poster.loading = 'lazy'
    poster.style.objectPosition = slot.focalPoint
    poster.addEventListener('error', () => poster.remove(), { once: true })
    poster.src = slot.poster
    figure.append(poster)
  }
  if (slot.src) {
    const video = element('video')
    video.controls = true
    video.playsInline = true
    video.preload = 'none'
    video.defaultMuted = true
    video.muted = true
    video.style.objectPosition = slot.focalPoint
    video.setAttribute('aria-label', slot.label || 'Memory video')
    if (slot.poster) video.poster = slot.poster
    figure.append(video)
    playableVideos.push({ node: video, slot, figure })
  }
  if (!figure.childElementCount) figure.setAttribute('aria-hidden', 'true')
  return figure
}

function makeFilms() {
  const section = element('section', 'films')
  section.dataset.theme = 'plum,lavender'
  section.setAttribute('aria-label', films.title || 'Films')
  if (films.title) section.append(element('h2', 'films-title', films.title))
  const row = section.appendChild(element('div', 'films-row'))
  row.append(...films.media.map(makeFrame))
  if (films.caption) section.append(element('p', 'films-caption', films.caption))
  return section
}

function heartCells(count) {
  const shape = (x, y) => (x * x + y * y - 1) ** 3 - x * x * y ** 3
  for (let size = 20; size < 200; size++) {
    const cells = []
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const x = -1.2 + ((col + 0.5) * 2.4) / size
        const y = 1.3 - ((row + 0.5) * 2.4) / size
        const value = shape(x, y)
        if (value <= 0) cells.push({ row, col, value })
      }
    }
    if (cells.length >= count) {
      const kept = cells.sort((a, b) => a.value - b.value).slice(0, count)
      return { size, cells: kept.sort((a, b) => a.row - b.row || a.col - b.col) }
    }
  }
  throw new Error('heart too large')
}

function makeFinale() {
  const section = element('section', 'finale')
  section.dataset.theme = 'plum,lavender'
  section.setAttribute('aria-label', `All ${TOTAL} moments`)
  const stage = section.appendChild(element('div', 'finale-stage'))
  const heart = stage.appendChild(element('div', 'heart'))
  heart.setAttribute('aria-hidden', 'true')
  const { size, cells } = heartCells(TOTAL)
  const rows = Math.ceil(TOTAL / gallery.tileColumns)
  heart.style.setProperty('--grid', size)
  heart.style.setProperty('--sheet', `url("${MEDIA}mosaic.webp")`)
  heart.style.setProperty('--sheet-size', `${gallery.tileColumns * 100}% ${rows * 100}%`)
  cells.forEach((cell, i) => {
    const tile = heart.appendChild(element('span', 'tile'))
    tile.dataset.n = i + 1
    tile.style.left = `${(cell.col / size) * 100}%`
    tile.style.top = `${(cell.row / size) * 100}%`
    const column = i % gallery.tileColumns
    const row = Math.floor(i / gallery.tileColumns)
    tile.style.backgroundPosition = `${(column / (gallery.tileColumns - 1)) * 100}% ${(row / (rows - 1)) * 100}%`
  })
  const line = stage.appendChild(element('p', 'finale-line'))
  line.append(element('span', 'finale-count', String(TOTAL)), ' moments of 2026')
  return section
}

const hero = makeHero()
const chapterNodes = chapterRanges().map(makeChapter)
main.append(hero, ...chapterNodes, makeFilms(), makeFinale())
if (closingLetter) {
  const letter = element('section', 'closing')
  letter.dataset.theme = 'pale-pink,plum'
  letter.append(element('div', 'closing-letter', closingLetter))
  main.append(letter)
}

/* ---------- Counter ---------- */

const counter = element('div', 'counter')
counter.setAttribute('aria-hidden', 'true')
const counterNumber = counter.appendChild(element('span', 'counter-n', pad(1)))
counter.append(element('span', 'counter-total', ` / ${TOTAL}`))
const counterBar = counter.appendChild(element('span', 'counter-bar'))
document.body.append(counter)

const inView = new Set()
let flipOverride = null
let atFinale = false
function renderCounter() {
  const n = atFinale ? TOTAL : flipOverride ?? (inView.size ? Math.max(...inView) : null)
  if (n == null) return
  counterNumber.textContent = pad(n)
  counterBar.style.transform = `scaleX(${n / TOTAL})`
}
const counterObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const button = entry.target
    const n = Number(button.dataset.n)
    const stacked = !reduceMotion.matches && button.closest('.block--flip') && button.previousElementSibling
    if (entry.isIntersecting && !stacked) inView.add(n)
    else inView.delete(n)
  }
  renderCounter()
}, { rootMargin: '0px 0px -38% 0px' })
document.querySelectorAll('#memories .ph').forEach((button) => counterObserver.observe(button))

/* ---------- Viewer ---------- */

const viewer = element('dialog', 'viewer')
viewer.setAttribute('aria-label', 'Photo viewer')
const viewerFigure = viewer.appendChild(element('figure', 'viewer-figure'))
const viewerImage = viewerFigure.appendChild(new Image())
const viewerCaption = viewerFigure.appendChild(element('figcaption', 'viewer-caption'))
const viewerPrev = viewer.appendChild(element('button', 'viewer-nav viewer-prev'))
const viewerNext = viewer.appendChild(element('button', 'viewer-nav viewer-next'))
const viewerClose = viewer.appendChild(element('button', 'viewer-close', 'Close'))
viewerPrev.setAttribute('aria-label', 'Previous photo')
viewerNext.setAttribute('aria-label', 'Next photo')
for (const button of [viewerPrev, viewerNext]) button.append(element('span', 'arrow'))
document.body.append(viewer)
let viewing = 1

function showInViewer(n, placeholder) {
  viewing = n
  const photo = photos[n - 1]
  viewerImage.alt = `2026 memory, photo ${n} of ${TOTAL}`
  viewerImage.width = photo.w
  viewerImage.height = photo.h
  viewerImage.style.setProperty('--c', photo.c)
  viewerImage.src = placeholder || src(n, 's')
  const large = new Image()
  large.onload = () => { if (viewing === n) viewerImage.src = large.src }
  large.src = src(n, 'l')
  viewerCaption.textContent = `${pad(n)} / ${TOTAL}`
  viewerPrev.disabled = n === 1
  viewerNext.disabled = n === TOTAL
  for (const near of [n - 1, n + 1]) if (near >= 1 && near <= TOTAL) new Image().src = src(near, 'l')
}

function openViewer(n, fromImage) {
  const open = () => {
    showInViewer(n, fromImage?.currentSrc)
    if (!viewer.open) viewer.showModal()
  }
  if (!document.startViewTransition || !fromImage || reduceMotion.matches) return open()
  fromImage.style.viewTransitionName = 'memory-photo'
  const transition = document.startViewTransition(() => {
    fromImage.style.viewTransitionName = ''
    viewerImage.style.viewTransitionName = 'memory-photo'
    open()
  })
  transition.finished.finally(() => { viewerImage.style.viewTransitionName = '' })
}

function step(direction) {
  const n = viewing + direction
  if (n < 1 || n > TOTAL) return
  showInViewer(n)
  if (!reduceMotion.matches) {
    gsap.fromTo(viewerImage, { x: direction * 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: 'power3.out' })
  }
}

main.addEventListener('click', (event) => {
  const button = event.target.closest('.ph')
  if (button) return openViewer(Number(button.dataset.n), button.querySelector('img'))
  const tile = event.target.closest('.tile')
  if (tile) openViewer(Number(tile.dataset.n))
})
viewerPrev.addEventListener('click', () => step(-1))
viewerNext.addEventListener('click', () => step(1))
viewerClose.addEventListener('click', () => viewer.close())
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close() })
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1)
  if (event.key === 'ArrowRight') step(1)
})
let swipeStart = null
viewer.addEventListener('pointerdown', (event) => { swipeStart = event.clientX })
viewer.addEventListener('pointerup', (event) => {
  if (swipeStart == null) return
  const distance = event.clientX - swipeStart
  swipeStart = null
  if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1)
})

/* ---------- Motion ---------- */

function setTheme(theme, animate) {
  const [bg, fg] = theme.split(',')
  gsap.to(root, { '--bg': token(bg), '--fg': token(fg), duration: animate ? 0.9 : 0, ease: 'power2.out', overwrite: true })
}

function themeTriggers(motion) {
  const sections = [...main.children].filter((node) => node.dataset.theme)
  sections.forEach((section, i) => {
    if (i === 0) return
    const head = section.querySelector('.chapter-head') || section
    ScrollTrigger.create({
      trigger: head,
      start: 'top 62%',
      onEnter: () => setTheme(section.dataset.theme, motion),
      onLeaveBack: () => setTheme(sections[i - 1].dataset.theme, motion),
    })
  })
}

function animateHero() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', pin: true, scrub: 0.8 },
  })
  tl.fromTo('.hero-photo', { scale: 0.4, rotation: -7, '--mat': '3.4vmin' },
    { scale: 1, rotation: 0, '--mat': '0vmin', ease: 'power2.inOut', duration: 1 }, 0)
    .to('.hero-photo img', { scale: 1.08, ease: 'none', duration: 1 }, 0)
    .to('.story-year', { yPercent: -70, opacity: 0, ease: 'power1.in', duration: 0.7 }, 0)
    .to('.hero-sub, .scroll-cue', { opacity: 0, y: -24, duration: 0.3 }, 0)
}

function revealBatch(targets, from, to) {
  gsap.set(targets, from)
  ScrollTrigger.batch(targets, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { ...to, stagger: 0.08, overwrite: true }),
  })
}

function animateChapterHead(head) {
  gsap.from(head.querySelectorAll('.char'), {
    yPercent: 115, opacity: 0, rotation: 6, stagger: 0.025, ease: 'power3.out',
    scrollTrigger: { trigger: head, start: 'top 80%', end: 'top 35%', scrub: 0.6 },
  })
  gsap.fromTo(head.querySelector('.chapter-num'), { yPercent: 35, opacity: 0.2 }, {
    yPercent: -25, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: head, start: 'top bottom', end: 'bottom top', scrub: true },
  })
}

const animateBlock = {
  spread(block) {
    const items = block.querySelectorAll('.ph')
    revealBatch(items, { clipPath: 'inset(22% 0% 0% 0%)', y: 60 },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'expo.out' })
    items.forEach((item) => {
      gsap.fromTo(item.querySelector('img'), { scale: 1.14, yPercent: -4 }, {
        scale: 1, yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
  },
  columns(block) {
    const speeds = narrow ? [-1, 1] : [-0.6, 1, -0.6]
    speeds.forEach((speed, i) => {
      gsap.fromTo(block.querySelectorAll(`[data-col="${i}"]`), { y: () => speed * innerHeight * 0.1 }, {
        y: () => -speed * innerHeight * 0.1, ease: 'none',
        scrollTrigger: { trigger: block, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      })
    })
    revealBatch(block.querySelectorAll('.ph img'), { opacity: 0, scale: 1.12 },
      { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' })
  },
  strip(block) {
    const track = block.querySelector('.strip-track')
    const distance = () => Math.max(0, track.scrollWidth - innerWidth)
    const move = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: block, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1,
        invalidateOnRefresh: true, anticipatePin: 1,
      },
    })
    track.querySelectorAll('.ph').forEach((item) => {
      gsap.fromTo(item.querySelector('img'), { xPercent: -7, scale: 1.18 }, {
        xPercent: 7, scale: 1.18, ease: 'none',
        scrollTrigger: { trigger: item, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
      })
    })
  },
  scatter(block) {
    revealBatch(block.querySelectorAll('.print'), { y: -140, opacity: 0, rotation: -18, scale: 1.18 },
      { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 1.1, ease: 'back.out(1.5)' })
  },
  flip(block) {
    const frames = [...block.querySelectorAll('.ph')]
    const now = block.querySelector('.flip-now')
    const steps = frames.length - 1
    gsap.set(frames.slice(1), { opacity: 0 })
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block, start: 'top top', end: () => `+=${steps * innerHeight * 0.26}`, pin: true, scrub: 0.5,
        invalidateOnRefresh: true, anticipatePin: 1,
        snap: { snapTo: 1 / steps, duration: { min: 0.12, max: 0.35 }, delay: 0.05, ease: 'power1.inOut' },
        onUpdate: (self) => {
          if (!self.isActive) return
          const n = frames[Math.round(self.progress * steps)].dataset.n
          flipOverride = Number(n)
          now.textContent = `Photo ${n}`
          renderCounter()
        },
        onToggle: (self) => { if (!self.isActive) { flipOverride = null; renderCounter() } },
      },
    })
    frames.slice(1).forEach((frame, i) => {
      tl.fromTo(frame, { opacity: 0, scale: 1.04, x: i % 2 ? 18 : -18, rotation: i % 2 ? 0.8 : -0.8 },
        { opacity: 1, scale: 1, x: 0, rotation: 0, duration: 1, ease: 'power2.out' })
    })
  },
}

function animateFinale() {
  const tiles = gsap.utils.toArray('.heart .tile')
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.finale', start: 'top top', end: '+=160%', pin: true, scrub: 0.8 },
  })
  tl.from(tiles, {
    x: () => gsap.utils.random(-0.7, 0.7) * innerWidth,
    y: () => gsap.utils.random(-0.8, 0.8) * innerHeight,
    rotation: () => gsap.utils.random(-120, 120),
    scale: 0.2, opacity: 0, ease: 'power3.out', duration: 1,
    stagger: { amount: 0.8, from: 'random' },
  })
    .from('.finale-line', { opacity: 0, y: 40, duration: 0.35 }, '-=0.2')
    .to('.heart', { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' })
}

gsap.matchMedia().add({
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
}, (context) => {
  const { motion } = context.conditions
  if (motion) animateHero()
  themeTriggers(motion)
  // Triggers are created top to bottom so every pin pushes the ones below it.
  for (const chapter of chapterNodes) {
    if (!motion) continue
    animateChapterHead(chapter.querySelector('.chapter-head'))
    chapter.querySelectorAll('.block').forEach((block) => animateBlock[block.dataset.layout](block))
  }
  if (motion) animateFinale()
  ScrollTrigger.create({
    trigger: '.finale', start: 'top 60%', end: 'max',
    onToggle: (self) => { atFinale = self.isActive; renderCounter() },
  })
  return () => { flipOverride = null }
})

window.addEventListener('load', () => ScrollTrigger.refresh())

/* ---------- Film playback (unchanged behaviour) ---------- */

function prepareVideo({ node, slot }) {
  if (node.hasAttribute('src')) return
  if (slot.captions) {
    const track = element('track')
    track.kind = 'captions'
    track.label = 'English'
    track.srclang = 'en'
    track.src = slot.captions
    node.append(track)
  }
  node.src = slot.src
}

if (playableVideos.length) {
  const visible = new Map()
  let activeVideo = null
  const byFigure = new Map(playableVideos.map((item) => [item.figure, item]))

  const prepareObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      prepareVideo(byFigure.get(entry.target))
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '60% 0px' })

  function chooseVideo() {
    const candidate = document.hidden
      ? null
      : [...visible].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    if (candidate === activeVideo) return
    if (activeVideo) activeVideo.node.pause()
    activeVideo = candidate
    if (!candidate || reduceMotion.matches) return
    prepareVideo(candidate)
    candidate.node.muted = true
    candidate.node.play().catch(() => {
      // A visible poster and native controls remain available if autoplay is denied.
    })
  }

  const playbackObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = byFigure.get(entry.target)
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        visible.set(item, entry.intersectionRatio)
      } else {
        visible.delete(item)
        item.node.pause()
      }
    }
    chooseVideo()
  }, { threshold: [0, 0.45, 0.6, 0.8] })

  for (const item of playableVideos) {
    prepareObserver.observe(item.figure)
    playbackObserver.observe(item.figure)
    item.node.addEventListener('play', () => {
      for (const other of playableVideos) if (other !== item) other.node.pause()
    })
  }
  document.addEventListener('visibilitychange', chooseVideo)
  reduceMotion.addEventListener('change', () => {
    activeVideo?.node.pause()
    activeVideo = null
    chooseVideo()
  })
}
