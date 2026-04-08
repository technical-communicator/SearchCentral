import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './EventsCalendar.css'

interface Event {
  id: number
  title: string
  date: string
  time: string | null
  location: string
  description: string | null
  link: string | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function EventsCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Event | null>(null)
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  function eventsOn(day: number) {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <main className="cal-page">
      <div className="container">
        <div className="cal-header">
          <div>
            <h1 className="section-title">Events Calendar</h1>
            <p className="section-subtitle">Upcoming events across Central Florida</p>
          </div>
          <Link to="/submit-event" className="btn btn-primary">+ Submit Event</Link>
        </div>

        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
          <span className="cal-month-label">{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
        </div>

        {loading ? (
          <div className="cal-loading"><div className="spinner" /></div>
        ) : (
          <div className="cal-grid">
            {DAYS.map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
              const dayEvents = eventsOn(day)
              return (
                <div
                  key={day}
                  className={`cal-cell ${isToday(day) ? 'cal-cell--today' : ''} ${dayEvents.length ? 'cal-cell--has-events' : ''}`}
                >
                  <span className="cal-day-num">{day}</span>
                  {dayEvents.slice(0, 3).map(ev => (
                    <button
                      key={ev.id}
                      className="cal-event-pill"
                      onClick={() => setSelected(ev)}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="cal-more">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Upcoming list */}
        <div className="events-list-section">
          <h2 className="events-list-title">Upcoming This Month</h2>
          {(() => {
            const monthEvents = events.filter(e => e.date.startsWith(monthStr))
            if (monthEvents.length === 0)
              return <p className="no-events">No events this month. <Link to="/submit-event">Submit one!</Link></p>
            return (
              <ul className="events-list">
                {monthEvents.map(ev => (
                  <li key={ev.id} className="event-card card" onClick={() => setSelected(ev)}>
                    <div className="event-card-date">
                      <span className="event-day">{new Date(ev.date + 'T00:00:00').getDate()}</span>
                      <span className="event-month">{MONTHS[new Date(ev.date + 'T00:00:00').getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="event-card-body">
                      <h3>{ev.title}</h3>
                      <p className="event-meta">
                        {ev.time && <span>🕐 {ev.time}</span>}
                        <span>📍 {ev.location}</span>
                      </p>
                      {ev.description && <p className="event-desc">{ev.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>
      </div>

      {/* Event detail modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <h2>{selected.title}</h2>
            <p className="event-meta" style={{ marginTop: 8 }}>
              <span>📅 {selected.date}{selected.time ? ` at ${selected.time}` : ''}</span>
              <span>📍 {selected.location}</span>
            </p>
            {selected.description && <p style={{ marginTop: 16, color: 'var(--muted)' }}>{selected.description}</p>}
            {selected.link && (
              <a
                href={selected.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: 20, display: 'inline-flex' }}
              >
                More Info →
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
