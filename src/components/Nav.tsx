import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Nav.css'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          Search Central <span>Florida</span>
        </Link>

        <button
          className={`nav-burger ${open ? 'nav-burger--open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/events" onClick={() => setOpen(false)}>Events</NavLink>
          <NavLink to="/submit-event" onClick={() => setOpen(false)}>Submit Event</NavLink>
          <NavLink to="/blog" onClick={() => setOpen(false)}>Blog</NavLink>
          <a
            href="https://patreon.com/SearchCentralFlorida"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-patreon"
            onClick={() => setOpen(false)}
          >
            Join Mail Club
          </a>
        </nav>
      </div>
    </header>
  )
}
