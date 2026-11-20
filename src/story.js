import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memories } from './memories-2026.js'
import './theme.css'
import './story.css'

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const chapter = document.querySelector('#memories')
const playableVideos = []
gsap.registerPlugin(ScrollTrigger)

function element(tag, className) {
  const node = document.createElement(tag)
  if (className) node.className = className
  return node
}

function appendText(parent, tag, className, value) {
  if (!value) return
  const node = element(tag, className)
  node.textContent = value
  parent.append(node)
}

function makeImage(slot, source, alt, eager = false) {
  const image = new Image()
  image.alt = alt
  image.loading = eager ? 'eager' : 'lazy'
  image.decoding = 'async'
  image.style.objectPosition = slot.focalPoint
  image.addEventListener('error', () => image.remove(), { once: true })
  image.src = source
  return image
}

function makeFrame(slot) {
  const figure = element('figure', 'memory-frame')
  figure.dataset.slot = slot.id
  figure.dataset.kind = slot.type
  figure.style.setProperty('--ratio', slot.aspect)
  figure.style.setProperty('--matte', `var(--${slot.tone})`)
  if (slot.type === 'photo' && slot.src) {
    figure.append(makeImage(slot, slot.src, slot.alt, slot.id === 'P01'))
  }
  if (slot.type === 'video' && slot.poster) {
    figure.append(makeImage(slot, slot.poster, ''))
  }
  if (slot.type === 'video' && slot.src) {
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

function makeScene(scene) {
  const section = element('section', `scene scene--${scene.id}`)
  section.id = scene.id
  if (scene.title) appendText(section, 'h2', 'scene-title', scene.title)
  const gallery = element('div', 'gallery')
  const frames = scene.media.map(makeFrame)
  const handoff = scene.handoff ? element('div', 'handoff') : null
  for (const frame of frames) {
    if (scene.handoff?.includes(frame.dataset.slot)) {
      if (!handoff.parentNode) gallery.append(handoff)
      handoff.append(frame)
    } else {
      gallery.append(frame)
    }
  }
  section.append(gallery)
  if (scene.id === 'opening') {
    const year = element('h1', 'story-year')
    year.textContent = '2026'
    frames[0].after(year)
    appendText(gallery, 'p', 'scroll-cue', 'Scroll to begin')
  }
  appendText(section, 'p', 'scene-caption', scene.caption)
  appendText(section, 'div', 'closing-letter', scene.letter)
  return section
}

chapter.append(...memories.map(makeScene))

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  gsap.fromTo('.story-year', { yPercent: 0 }, {
    yPercent: -26,
    ease: 'none',
    scrollTrigger: { trigger: '#opening', start: 'top top', end: '50% top', scrub: true },
  })
  const detail = document.querySelector('[data-slot="P03"]')
  gsap.fromTo(detail, { '--detail-inset': '21%', '--detail-scale': 1.38 }, {
    '--detail-inset': '0%',
    '--detail-scale': 1,
    ease: 'none',
    scrollTrigger: {
      trigger: detail, start: 'center center', end: () => `+=${Math.min(innerHeight * 0.36, 290)}`,
      pin: true, scrub: true, invalidateOnRefresh: true,
    },
  })
  document.querySelectorAll('.gallery > .memory-frame:not([data-slot="P01"], [data-slot="P03"])').forEach((frame) => {
    gsap.fromTo(frame, { '--reveal': '18%', '--lift': '1.4rem' }, {
      '--reveal': '0%', '--lift': '0rem', ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top 98%', end: 'top 56%', scrub: true },
    })
  })
  document.querySelectorAll('.handoff').forEach((handoff) => {
    gsap.fromTo(handoff, { '--handoff': '100%' }, {
      '--handoff': '0%', ease: 'none',
      scrollTrigger: { trigger: handoff, start: 'top 76%', end: 'top 36%', scrub: true },
    })
  })
})

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
