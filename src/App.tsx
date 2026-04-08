import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import EventsCalendar from './pages/EventsCalendar'
import SubmitEvent from './pages/SubmitEvent'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Admin from './pages/Admin'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsCalendar />} />
        <Route path="/submit-event" element={<SubmitEvent />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <span className="footer-logo">Search Central <span>Florida</span></span>
            <div className="footer-links">
              <a href="https://www.instagram.com/searchcentralfl/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://patreon.com/SearchCentralFlorida" target="_blank" rel="noopener noreferrer">Patreon</a>
            </div>
            <p className="footer-copy">&copy; {new Date().getFullYear()} Search Central Florida</p>
          </div>
        </div>
      </footer>
    </>
  )
}
