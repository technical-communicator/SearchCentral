// ── Helpers ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id)
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Mobile nav ───────────────────────────────────────────────────────────────
$('burger').addEventListener('click', () => {
  $('nav-links').classList.toggle('open')
})
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => $('nav-links').classList.remove('open'))
})

// ── Footer year ──────────────────────────────────────────────────────────────
$('year').textContent = new Date().getFullYear()

// ── Calendar ─────────────────────────────────────────────────────────────────
let allEvents = []
const today = new Date()
let calYear  = today.getFullYear()
let calMonth = today.getMonth()

async function loadEvents() {
  try {
    const res = await fetch('/api/events')
    allEvents = await res.json()
  } catch { allEvents = [] }
  renderCalendar()
  renderEventsList()
}

function renderCalendar() {
  $('cal-label').textContent = `${MONTHS[calMonth]} ${calYear}`

  const firstDay    = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthStr    = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`

  let html = DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join('')

  // Empty cells before 1st
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell cal-cell-empty"></div>`

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr    = `${monthStr}-${String(day).padStart(2, '0')}`
    const dayEvents  = allEvents.filter(e => e.date === dateStr)
    const isToday    = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()

    let pills = dayEvents.slice(0, 3).map(ev =>
      `<button class="cal-pill" data-id="${ev.id}">${escHtml(ev.title)}</button>`
    ).join('')
    if (dayEvents.length > 3) pills += `<span class="cal-more">+${dayEvents.length - 3} more</span>`

    html += `<div class="cal-cell ${isToday ? 'cal-today' : ''}">
      <span class="cal-num">${day}</span>${pills}
    </div>`
  }

  $('cal-grid').innerHTML = html

  // Pill click → modal
  $('cal-grid').querySelectorAll('.cal-pill').forEach(btn => {
    btn.addEventListener('click', () => openModal(+btn.dataset.id))
  })
}

function renderEventsList() {
  const monthStr  = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`
  const monthEvts = allEvents.filter(e => e.date.startsWith(monthStr))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (monthEvts.length === 0) {
    $('events-list').innerHTML = `<p class="no-events">No events this month. <a href="#submit">Submit one!</a></p>`
    return
  }

  $('events-list').innerHTML = monthEvts.map(ev => {
    const d   = new Date(ev.date + 'T00:00:00')
    const day = d.getDate()
    const mon = MONTHS[d.getMonth()].slice(0, 3)
    return `<div class="event-card" data-id="${ev.id}">
      <div class="event-date-box"><span class="event-day">${day}</span><span class="event-month">${mon}</span></div>
      <div class="event-body">
        <h3>${escHtml(ev.title)}</h3>
        <div class="event-meta">
          ${ev.time ? `<span>🕐 ${ev.time}</span>` : ''}
          <span>📍 ${escHtml(ev.location)}</span>
        </div>
        ${ev.description ? `<p class="event-desc">${escHtml(ev.description)}</p>` : ''}
      </div>
    </div>`
  }).join('')

  $('events-list').querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => openModal(+card.dataset.id))
  })
}

$('cal-prev').addEventListener('click', () => {
  if (calMonth === 0) { calMonth = 11; calYear-- } else calMonth--
  renderCalendar(); renderEventsList()
})
$('cal-next').addEventListener('click', () => {
  if (calMonth === 11) { calMonth = 0; calYear++ } else calMonth++
  renderCalendar(); renderEventsList()
})

// ── Event modal ───────────────────────────────────────────────────────────────
function openModal(id) {
  const ev = allEvents.find(e => e.id === id)
  if (!ev) return
  $('modal-title').textContent = ev.title
  $('modal-meta').innerHTML =
    `<span>📅 ${ev.date}${ev.time ? ' at ' + ev.time : ''}</span><span>📍 ${escHtml(ev.location)}</span>`
  $('modal-desc').textContent  = ev.description || ''
  const link = $('modal-link')
  if (ev.link) { link.href = ev.link; link.style.display = 'inline-flex' }
  else          { link.style.display = 'none' }
  $('modal-backdrop').classList.add('open')
}

$('modal-close').addEventListener('click', () => $('modal-backdrop').classList.remove('open'))
$('modal-backdrop').addEventListener('click', e => {
  if (e.target === $('modal-backdrop')) $('modal-backdrop').classList.remove('open')
})

// ── Event submit form ────────────────────────────────────────────────────────
$('event-form').addEventListener('submit', async e => {
  e.preventDefault()
  const btn    = $('form-submit')
  const status = $('form-status')
  btn.disabled = true
  btn.textContent = 'Submitting…'
  status.innerHTML = ''

  const data = Object.fromEntries(new FormData(e.target))

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) { const j = await res.json(); throw new Error(j.error || 'Error') }
    status.innerHTML = `<p class="form-status-ok">🎉 Event submitted! It'll appear on the calendar.</p>`
    e.target.reset()
    await loadEvents() // refresh calendar
  } catch (err) {
    status.innerHTML = `<p class="form-status-error">❌ ${err.message}</p>`
  } finally {
    btn.disabled = false
    btn.textContent = 'Submit Event'
  }
})

// ── Blog ──────────────────────────────────────────────────────────────────────
async function loadBlog() {
  try {
    const res   = await fetch('/api/posts')
    const posts = await res.json()
    if (posts.length === 0) {
      $('blog-grid').innerHTML = `<p class="blog-empty">Posts coming soon — check back!</p>`
      return
    }
    $('blog-grid').innerHTML = posts.map(p => `
      <a href="/blog/${p.slug}" class="blog-card">
        <span class="blog-card-date">${formatDate(p.created_at)}</span>
        <h3 class="blog-card-title">${escHtml(p.title)}</h3>
        ${p.excerpt ? `<p class="blog-card-excerpt">${escHtml(p.excerpt)}</p>` : ''}
        <span class="blog-read-more">Read more →</span>
      </a>`).join('')
  } catch {
    $('blog-grid').innerHTML = `<p class="blog-empty">Posts coming soon.</p>`
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadEvents()
loadBlog()
