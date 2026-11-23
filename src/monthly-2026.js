import archive from './creativity-archive.json'
import './monthly-2026.css'

const year = '2026'
const motion = matchMedia('(prefers-reduced-motion: reduce)')
const monthNames = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' })
const dateLabel = new Intl.DateTimeFormat('en', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})

// Photo IDs refer to the dated Creativity export.
const highlights = [
  ['Fountain lights', 'Purple fountains after dark, a sheet of stickers, and a peace sign up close.', ['0164', '0182', '0192', '0196']],
  ['Flowers for you', 'A sunflower bouquet, couch portraits, and a Valentine’s Day selfie.', ['0216', '0329', '0347']],
  ['A shore and a school day', 'The shore under a blue sky, lunch by a window, and a photo together outside school.', ['0350', '0364', '0384']],
  ['All dressed in gold', 'Dinner together, gold dresses, and city lights after dark.', ['0419', '0404', '0407', '0437']],
  ['A little closer to summer', 'Iced drinks, palm trees by the water, and an evening under the garden lights.', ['0545', '0479', '0535', '0594', '0601']],
  ['Under an open sky', 'Open skies by the water, a wooden window portrait, and a school-uniform portrait.', ['0678', '0639', '0692', '0707', '0751']],
  ['Two seats at the table', 'Meals together and the faces we made between them.', ['0752', '0767', '0783', '0786']],
  ['Between classes', 'A classroom whiteboard, a mirror photo, and lunch together.', ['0797', '0788', '0804', '0810']],
  ['A little lavender cake', 'A lavender cake, photos together, and one very serious pout.', ['0814', '0823', '0827', '0840']],
  ['Through the museum', 'Gallery walls, cave ceilings, and a portrait inside a pair of shark jaws.', ['0846', '0844', '0845', '0852']],
  ['Autumn in Japan', 'Autumn leaves, red lanterns, and blue skies over DisneySea.', ['0943', '0862', '0881', '0893', '0906']],
]

const months = Array.from({ length: 12 }, (_, i) => {
  const key = year + '-' + String(i + 1).padStart(2, '0')
  const name = monthNames.format(new Date(key + '-01T00:00:00Z'))
  const photos = archive.filter(({ kind, timestamp }) => kind === 'photo' && timestamp.startsWith(key))
  const [title, description, ids] = highlights[i] ?? ['', '', []]
  const picks = ids.map((id) => photos.find((photo) => photo.id === id)).filter(Boolean)
  return { name, photos, title, description, picks: picks.length ? picks : photos.slice(0, 4) }
})

function dateText(timestamp) {
  // The export uses local wall times. UTC formatting preserves the recorded calendar date.
  return dateLabel.format(new Date(timestamp + 'Z'))
}

function node(tag, className, text) {
  const result = document.createElement(tag)
  if (className) result.className = className
  if (text) result.textContent = text
  return result
}

function button(className, label, action) {
  const result = node('button', className, label)
  result.type = 'button'
  result.addEventListener('click', action)
  return result
}

function imageUrl(path) {
  return '../media/creativity/' + path
}

export function renderMonthly2026() {
  const section = node('section', 'monthly')
  section.id = 'monthly'
  section.setAttribute('aria-labelledby', 'monthly-title')
  const inner = node('div', 'monthly-inner')
  const intro = node('header', 'monthly-intro')
  const title = node('h2', '', 'Our year in photos')
  title.id = 'monthly-title'
  const total = months.reduce((sum, month) => sum + month.photos.length, 0)
  intro.append(title, node('p', '', total + ' dated photos from 2026. Pick a month, then swipe through its highlights.'))

  const navigation = node('div', 'monthly-navigation')
  navigation.setAttribute('role', 'group')
  navigation.setAttribute('aria-label', 'Months of 2026')
  const monthButtons = months.map(({ name }, index) => {
    const control = button('monthly-month', name.slice(0, 3), () => selectMonth(index))
    control.setAttribute('aria-label', name)
    control.setAttribute('aria-controls', 'monthly-album')
    navigation.append(control)
    return control
  })

  const album = node('div', 'monthly-album')
  album.id = 'monthly-album'
  const albumText = node('div', 'monthly-album-text')
  const monthTitle = node('h3', 'monthly-album-title')
  const theme = node('p', 'monthly-theme')
  const description = node('p', 'monthly-description')
  const browse = button('monthly-browse', '', () => openAlbum(0))
  browse.setAttribute('aria-haspopup', 'dialog')
  const empty = node('p', 'monthly-empty', 'There are no dated photos for this month yet.')
  albumText.append(monthTitle, theme, description, browse, empty)

  const showcase = node('div', 'monthly-showcase')
  const track = node('ol', 'monthly-track')
  track.id = 'monthly-highlights'
  track.setAttribute('aria-label', 'Monthly highlights')
  const railProgress = node('span', 'monthly-progress')
  const railControls = node('div', 'monthly-rail-controls')
  const back = button('monthly-arrow', '←', () => advanceHighlight(-1))
  const forward = button('monthly-arrow', '→', () => advanceHighlight(1))
  back.setAttribute('aria-label', 'Previous highlight')
  forward.setAttribute('aria-label', 'Next highlight')
  back.setAttribute('aria-controls', track.id)
  forward.setAttribute('aria-controls', track.id)
  railControls.append(railProgress, back, forward)
  showcase.append(track, railControls)
  album.append(albumText, showcase)

  const dialog = node('dialog', 'monthly-viewer')
  dialog.setAttribute('aria-labelledby', 'monthly-viewer-title')
  const dialogHead = node('div', 'monthly-viewer-header')
  const dialogTitle = node('h3')
  dialogTitle.id = 'monthly-viewer-title'
  const close = button('monthly-viewer-button', 'Close', () => dialog.close())
  close.autofocus = true
  dialogHead.append(dialogTitle, close)
  const stage = node('figure', 'monthly-viewer-stage')
  const viewport = node('div', 'monthly-viewer-viewport')
  const image = node('img', 'monthly-viewer-image')
  image.draggable = false
  viewport.append(image)
  const caption = node('figcaption', 'monthly-viewer-caption')
  caption.setAttribute('aria-live', 'polite')
  caption.setAttribute('aria-atomic', 'true')
  const time = node('time')
  const position = node('span')
  caption.append(time, position)
  stage.append(viewport, caption)
  const toolbar = node('div', 'monthly-viewer-toolbar')
  const jumpLabel = node('label', 'monthly-date-jump')
  const jump = node('select')
  jumpLabel.append(node('span', '', 'Jump to date'), jump)
  const arrows = node('div', 'monthly-viewer-arrows')
  const previous = button('monthly-viewer-button', '← Previous', () => stepPhoto(-1))
  const next = button('monthly-viewer-button', 'Next →', () => stepPhoto(1))
  arrows.append(previous, next)
  toolbar.append(jumpLabel, arrows)
  dialog.append(dialogHead, stage, toolbar)

  inner.append(intro, navigation, album)
  section.append(inner, dialog)

  let month = months[0]
  let index = 0
  let activeHighlight = 0
  let pendingHighlight = null
  let updateFrame = 0
  let slideAnimation
  let drag = null

  function selectMonth(monthIndex) {
    month = months[monthIndex]
    monthButtons.forEach((control, i) => control.setAttribute('aria-pressed', String(i === monthIndex)))
    monthTitle.textContent = month.name
    browse.textContent = 'View all ' + month.photos.length + (month.photos.length === 1 ? ' photo' : ' photos')
    theme.textContent = month.title
    theme.hidden = !month.photos.length
    description.textContent = month.description
    description.hidden = !month.description
    empty.hidden = Boolean(month.photos.length)
    browse.hidden = !month.photos.length
    showcase.hidden = !month.picks.length
    album.classList.toggle('monthly-album-empty', !month.photos.length)
    track.replaceChildren(...month.picks.map((photo) => {
      const card = node('li', 'monthly-card')
      const date = dateText(photo.timestamp)
      const show = button('monthly-image-button', '', () => openAlbum(month.photos.indexOf(photo)))
      show.setAttribute('aria-label', 'Open photo from ' + date)
      show.setAttribute('aria-haspopup', 'dialog')

      const img = node('img')
      img.src = imageUrl(photo.preview)
      img.loading = 'lazy'
      img.decoding = 'async'
      img.alt = ''
      img.draggable = false
      const stamp = node('time', 'monthly-stamp', date)
      stamp.dateTime = photo.timestamp
      show.append(img)
      card.append(show, stamp)
      return card
    }))
    track.scrollLeft = 0
    activeHighlight = 0
    pendingHighlight = null
    updateRailControls()
    requestRailUpdate()
  }

  function updateRailControls() {
    railProgress.textContent = month.picks.length
      ? 'Highlight ' + (activeHighlight + 1) + ' of ' + month.picks.length
      : ''
    back.disabled = activeHighlight === 0
    forward.disabled = activeHighlight >= month.picks.length - 1
  }

  function updateRail() {
    updateFrame = 0
    if (!track.clientWidth || !track.children.length) return
    const trackWidth = track.clientWidth
    const scrollLeft = track.scrollLeft
    let closest = Infinity
    for (const [cardIndex, card] of Array.from(track.children).entries()) {
      const offset = card.offsetLeft - scrollLeft
      const distance = Math.abs(offset)
      if (distance < closest) {
        closest = distance
        activeHighlight = cardIndex
      }
      const parallax = Math.max(-6, Math.min(6, offset / trackWidth * -7))
      card.style.setProperty('--monthly-pan', motion.matches ? '0%' : parallax + '%')
    }
    for (const [cardIndex, card] of Array.from(track.children).entries()) {
      card.toggleAttribute('data-current', cardIndex === activeHighlight)
    }
    if (pendingHighlight === activeHighlight) pendingHighlight = null
    updateRailControls()
  }

  function requestRailUpdate() {
    if (!updateFrame) updateFrame = requestAnimationFrame(updateRail)
  }

  function advanceHighlight(direction) {
    const target = Math.max(0, Math.min((pendingHighlight ?? activeHighlight) + direction, month.picks.length - 1))
    const card = track.children[target]
    if (!card) return
    const left = card.offsetLeft
    pendingHighlight = target
    track.scrollTo({ left, behavior: motion.matches ? 'instant' : 'smooth' })
  }

  track.addEventListener('scroll', requestRailUpdate, { passive: true })
  track.addEventListener('scrollend', () => { pendingHighlight = null })
  track.addEventListener('pointerdown', () => { pendingHighlight = null })
  motion.addEventListener('change', requestRailUpdate)
  new ResizeObserver(requestRailUpdate).observe(track)

  function openAlbum(initialIndex) {
    dialogTitle.textContent = month.name + ' ' + year
    const dates = new Set(month.photos.map(({ timestamp }) => timestamp.slice(0, 10)))
    jump.replaceChildren(...Array.from(dates, (day) => {
      const option = node('option', '', dateText(day + 'T00:00:00'))
      option.value = day
      return option
    }))
    jump.disabled = dates.size === 1
    showPhoto(initialIndex)
    dialog.showModal()
    document.documentElement.classList.add('viewer-open')
  }

  function showPhoto(photoIndex, direction = 0) {
    index = photoIndex
    const photo = month.photos[index]
    image.src = imageUrl(photo.preview)
    image.alt = 'Archive photo from ' + dateText(photo.timestamp)
    time.dateTime = photo.timestamp
    time.textContent = dateText(photo.timestamp)
    position.textContent = (index + 1) + ' of ' + month.photos.length
    jump.value = photo.timestamp.slice(0, 10)
    previous.disabled = next.disabled = month.photos.length < 2
    slideAnimation?.cancel()
    if (!motion.matches && direction) {
      slideAnimation = image.animate([
        { opacity: 0.4, translate: direction * 8 + '% 0', scale: 0.98 },
        { opacity: 1, translate: '0 0', scale: 1 },
      ], { duration: 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
    }
  }

  function stepPhoto(direction) {
    const count = month.photos.length
    if (count > 1) showPhoto((index + count + direction) % count, direction)
  }

  jump.addEventListener('change', () => {
    const target = month.photos.findIndex(({ timestamp }) => timestamp.startsWith(jump.value))
    if (target >= 0) showPhoto(target)
  })
  dialog.addEventListener('keydown', (event) => {
    if (event.target === jump || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    stepPhoto(event.key === 'ArrowRight' ? 1 : -1)
  })
  dialog.addEventListener('close', () => {
    resetDrag()
    document.documentElement.classList.remove('viewer-open')
  })

  function resetDrag() {
    drag = null
    viewport.style.removeProperty('--monthly-drag')
  }

  viewport.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || month.photos.length < 2) return
    slideAnimation?.cancel()
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
    viewport.setPointerCapture(event.pointerId)
  })
  viewport.addEventListener('pointermove', (event) => {
    if (drag?.id !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) resetDrag()
    else if (!motion.matches) viewport.style.setProperty('--monthly-drag', dx * 0.38 + 'px')
  })
  viewport.addEventListener('pointerup', (event) => {
    if (drag?.id !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    resetDrag()
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) stepPhoto(dx < 0 ? 1 : -1)
  })
  viewport.addEventListener('pointercancel', resetDrag)
  viewport.addEventListener('lostpointercapture', resetDrag)

  selectMonth(0)
  return section
}

