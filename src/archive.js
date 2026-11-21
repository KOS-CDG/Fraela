import './archive.css'
import archive from './creativity-archive.json'

const ARCHIVE = './'
const CREATIVITY = './?folder=creativity'
const MEDIA = '../media/creativity/'
const monthHref = (key) => `${CREATIVITY}&month=${key}`
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})

const months = new Map()
const years = new Map()
for (const item of archive) {
  const key = item.timestamp.slice(0, 7)
  if (!months.has(key)) {
    const year = key.slice(0, 4)
    const name = monthFormat.format(new Date(`${key}-01T00:00:00Z`))
    const month = { key, name, title: `${name} ${year}`, items: [] }
    months.set(key, month)
    if (!years.has(year)) years.set(year, [])
    years.get(year).push(month)
  }
  months.get(key).items.push(item)
}

const query = new URLSearchParams(location.search)
const inCreativity = query.get('folder') === 'creativity'
const monthKey = inCreativity ? query.get('month') : null
const month = months.get(monthKey)
const missingMonth = monthKey !== null && !month
const folderTitle = month?.title ?? (missingMonth ? 'Month not found' : inCreativity ? 'Creativity' : 'Archive')

function element(tag, className, label) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (label) node.textContent = label
  return node
}

function icon(className) {
  const node = element('span', className)
  node.setAttribute('aria-hidden', 'true')
  return node
}

function link(label, href, className) {
  const node = element('a', className, label)
  node.href = href
  return node
}

function itemCount(count) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

function treeEntry(label, href, active, accessibleLabel = label) {
  const row = element('li')
  const anchor = link('', href, 'tree-link')
  anchor.append(icon('folder-icon'), document.createTextNode(label))
  if (label !== accessibleLabel) anchor.setAttribute('aria-label', accessibleLabel)
  if (active) anchor.setAttribute('aria-current', 'page')
  row.append(anchor)
  return row
}

function renderNavigation() {
  const folders = [['Archive', ARCHIVE]]
  if (inCreativity) folders.push(['Creativity', CREATIVITY])
  if (monthKey !== null) folders.push([folderTitle, ''])

  const breadcrumbs = folders.map(([label, href], index) => {
    const crumb = element('li')
    if (index === folders.length - 1) {
      crumb.textContent = label
      crumb.setAttribute('aria-current', 'page')
    } else {
      crumb.append(link(label, href))
    }
    return crumb
  })
  document.querySelector('#breadcrumbs').replaceChildren(...breadcrumbs)
  document.querySelector('#up-folder').href = folders.at(-2)?.[1] ?? '../'

  const root = treeEntry('Archive', ARCHIVE, !inCreativity)
  const creativity = treeEntry('Creativity', CREATIVITY, inCreativity && monthKey === null)
  const archiveBranch = element('ul')
  archiveBranch.append(creativity)
  root.append(archiveBranch)
  document.querySelector('#folder-tree').append(root)
  if (!inCreativity) return

  const select = document.querySelector('#month-select')
  const placeholder = new Option('Choose a month', '')
  placeholder.disabled = true
  select.append(placeholder)
  const branch = element('ul', 'tree-years')
  for (const [year, yearMonths] of years) {
    const group = element('li')
    const list = element('ul')
    const options = element('optgroup')
    options.label = year
    for (const entry of yearMonths) {
      list.append(treeEntry(entry.name, monthHref(entry.key), month?.key === entry.key, entry.title))
      options.append(new Option(entry.title, entry.key))
    }
    group.append(element('span', 'tree-year', year), list)
    branch.append(group)
    select.append(options)
  }
  creativity.append(branch)
  select.value = month?.key ?? ''
  select.addEventListener('change', () => location.assign(monthHref(select.value)))
  document.querySelector('#month-picker').hidden = false
}

function folderTile(label, href, details, title = label) {
  const tile = link('', href, 'folder-tile')
  if (title !== label) tile.setAttribute('aria-label', `${title}, ${details}`)
  const art = element('span', 'folder-art')
  art.append(icon('folder-icon'))
  tile.append(art, element('strong', null, label), element('span', 'folder-details', details))
  const row = element('li')
  row.append(tile)
  return row
}

function timestampParts(timestamp) {
  return [dateFormat.format(new Date(`${timestamp}Z`)), timestamp.slice(11)]
}

function displayTimestamp(node, item) {
  const [date, clock] = timestampParts(item.timestamp)
  node.dateTime = item.timestamp
  node.replaceChildren(element('span', null, date), element('span', 'clock', clock))
}

function itemLabel(item) {
  return `${item.kind === 'video' ? 'Video' : 'Photo'} ${item.id}`
}

const dialog = document.querySelector('#archive-viewer')
const viewerMedia = document.querySelector('#viewer-media')
const viewerTitle = document.querySelector('#viewer-title')
const viewerTime = document.querySelector('#viewer-time')
const previous = document.querySelector('#viewer-previous')
const next = document.querySelector('#viewer-next')
const close = dialog.querySelector('.close-viewer')
let viewedIndex = 0
let opener

function showItem(index) {
  const item = month?.items[index]
  if (!item) return
  viewedIndex = index
  viewerTitle.textContent = itemLabel(item)
  displayTimestamp(viewerTime, item)
  previous.disabled = index === 0
  next.disabled = index === month.items.length - 1
  if (document.activeElement === previous && previous.disabled) next.focus()
  if (document.activeElement === next && next.disabled) previous.focus()

  let media
  if (item.kind === 'video') {
    media = element('video')
    media.controls = true
    media.playsInline = true
    media.preload = 'metadata'
    media.setAttribute('aria-label', itemLabel(item))
  } else {
    media = element('img')
    media.alt = itemLabel(item)
  }
  media.addEventListener('error', () => {
    if (media.parentNode === viewerMedia) {
      viewerMedia.replaceChildren(element('p', null, 'This file could not be loaded.'))
    }
  }, { once: true })
  media.src = MEDIA + item.preview
  viewerMedia.replaceChildren(media)
}

function stopVideo() {
  viewerMedia.querySelector('video')?.pause()
}

function openItem(index, button) {
  opener = button
  showItem(index)
  dialog.showModal()
}

function changeItem(offset) {
  if (!month?.items[viewedIndex + offset]) return
  stopVideo()
  showItem(viewedIndex + offset)
}

previous.addEventListener('click', () => changeItem(-1))
next.addEventListener('click', () => changeItem(1))
close.addEventListener('click', () => dialog.close())
dialog.addEventListener('close', () => {
  stopVideo()
  viewerMedia.replaceChildren()
  opener?.focus()
})
dialog.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLVideoElement || event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  changeItem(event.key === 'ArrowLeft' ? -1 : 1)
})

function fileTile(item, index) {
  const row = element('li', 'file')
  const button = element('button', 'file-button')
  button.type = 'button'
  button.setAttribute('aria-label', [itemLabel(item), ...timestampParts(item.timestamp)].join(', '))
  button.setAttribute('aria-haspopup', 'dialog')
  const thumbnail = element('span', 'file-thumb')
  if (item.kind === 'photo') {
    const image = element('img')
    image.alt = ''
    image.loading = 'lazy'
    image.decoding = 'async'
    image.addEventListener('error', () => thumbnail.replaceChildren(element('span', null, 'Preview unavailable')), { once: true })
    image.src = MEDIA + item.thumb
    thumbnail.append(image)
  } else {
    thumbnail.classList.add('video-thumb')
    thumbnail.append(icon('play-icon'), element('span', null, 'Video'))
  }
  const time = element('time', 'file-time')
  displayTimestamp(time, item)
  button.append(thumbnail, time)
  button.addEventListener('click', () => openItem(index, button))
  row.append(button)
  return row
}

function renderContents() {
  const contents = document.querySelector('#folder-items')
  const status = document.querySelector('#archive-status')
  if (month) {
    const files = element('ul', 'file-grid')
    files.setAttribute('aria-label', `${month.title} files`)
    files.append(...month.items.map(fileTile))
    contents.append(files)
    status.textContent = itemCount(month.items.length)
  } else if (missingMonth) {
    const message = element('p', 'missing-folder', 'This month is unavailable. ')
    message.append(link('Back to Creativity', CREATIVITY))
    contents.append(message)
    status.textContent = 'Folder unavailable'
  } else if (inCreativity) {
    for (const [year, yearMonths] of years) {
      const group = element('section', 'year-group')
      const folders = element('ul', 'folder-grid')
      for (const entry of yearMonths) {
        folders.append(folderTile(entry.name, monthHref(entry.key), itemCount(entry.items.length), entry.title))
      }
      group.append(element('h2', null, year), folders)
      contents.append(group)
    }
    status.textContent = `${months.size} folders · ${itemCount(archive.length)}`
  } else {
    const folders = element('ul', 'folder-grid')
    folders.append(folderTile('Creativity', CREATIVITY, `${months.size} folders · ${itemCount(archive.length)}`))
    contents.append(folders)
    status.textContent = '1 folder'
  }
}

document.title = `${folderTitle} · To My Fairest Love`
document.querySelector('#window-label').textContent = folderTitle
document.querySelector('#folder-heading').textContent = folderTitle
renderNavigation()
renderContents()
