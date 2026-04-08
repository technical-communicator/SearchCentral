import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

interface IgPost {
  id: number
  url: string
  category: string
  caption: string
  post_date: string
}

export default function Home() {
  const [igPosts, setIgPosts] = useState<IgPost[]>([])

  useEffect(() => {
    fetch('/api/instagram')
      .then(r => r.json())
      .then(setIgPosts)
      .catch(() => {})
  }, [])

  // Load Instagram embed script
  useEffect(() => {
    if (igPosts.length === 0) return
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]')
    if (existing) {
      // Re-process embeds if script already loaded
      if ((window as Window & { instgrm?: { Embeds: { process: () => void } } }).instgrm) {
        (window as Window & { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds.process()
      }
      return
    }
    const script = document.createElement('script')
    script.src = '//www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
  }, [igPosts])

  const eventsPosts = igPosts.filter(p => p.category === 'events')
  const filmPosts = igPosts.filter(p => p.category === 'film')
  const otherPosts = igPosts.filter(p => p.category !== 'events' && p.category !== 'film')

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              Discover Central Florida's<br />
              <span>Best Local Events</span>
            </h1>
            <p>Search Central Florida is your guide to what's happening in the heart of the Sunshine State — from art shows to food festivals, we find it all.</p>
            <div className="hero-actions">
              <Link to="/events" className="btn btn-primary">View Events Calendar</Link>
              <a
                href="https://www.instagram.com/searchcentralfl/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
          <div className="hero-badge">
            <div className="hero-badge-inner">
              <span className="hero-badge-icon">🌴</span>
              <span>Central Florida's<br />Event Hub</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mail Club CTA */}
      <section className="mailclub">
        <div className="container">
          <div className="mailclub-inner">
            <div>
              <h2>Join the Mail Club</h2>
              <p>Get exclusive Central Florida event picks, behind-the-scenes content, and more — delivered straight to your inbox via our Patreon.</p>
            </div>
            <a
              href="https://patreon.com/SearchCentralFlorida?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Join on Patreon →
            </a>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="section ig-section">
        <div className="container">
          <h2 className="section-title">From Our Instagram</h2>
          <p className="section-subtitle">
            Follow{' '}
            <a href="https://www.instagram.com/searchcentralfl/" target="_blank" rel="noopener noreferrer">
              @searchcentralfl
            </a>{' '}
            for daily Central Florida content.
          </p>

          {eventsPosts.length > 0 && (
            <div className="ig-category">
              <h3 className="ig-category-title">
                <span className="tag tag-events">Events</span>
              </h3>
              <div className="ig-grid">
                {eventsPosts.map(post => (
                  <IgEmbed key={post.id} url={post.url} />
                ))}
              </div>
            </div>
          )}

          {filmPosts.length > 0 && (
            <div className="ig-category">
              <h3 className="ig-category-title">
                <span className="tag tag-film">Film Photos</span>
              </h3>
              <div className="ig-grid">
                {filmPosts.map(post => (
                  <IgEmbed key={post.id} url={post.url} />
                ))}
              </div>
            </div>
          )}

          {otherPosts.length > 0 && (
            <div className="ig-category">
              <h3 className="ig-category-title">
                <span className="tag tag-general">Recent Posts</span>
              </h3>
              <div className="ig-grid">
                {otherPosts.map(post => (
                  <IgEmbed key={post.id} url={post.url} />
                ))}
              </div>
            </div>
          )}

          {igPosts.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Loading posts…</p>
          )}
        </div>
      </section>

      {/* Submit Event CTA */}
      <section className="submit-cta">
        <div className="container submit-cta-inner">
          <div>
            <h2>Hosting an Event?</h2>
            <p>Submit your event to appear on our community calendar and reach thousands of Central Florida locals.</p>
          </div>
          <Link to="/submit-event" className="btn btn-secondary">Submit Your Event</Link>
        </div>
      </section>
    </main>
  )
}

function IgEmbed({ url }: { url: string }) {
  const embedUrl = url.includes('?') ? url.split('?')[0] : url
  const permalink = embedUrl.endsWith('/') ? embedUrl : `${embedUrl}/`

  return (
    <div className="ig-embed-wrap">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={`${permalink}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version="14"
      />
    </div>
  )
}
