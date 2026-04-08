import { useState, FormEvent } from 'react'
import './SubmitEvent.css'

export default function SubmitEvent() {
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    link: '',
    contact_email: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      setStatus('success')
      setForm({ title: '', date: '', time: '', location: '', description: '', link: '', contact_email: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <main className="submit-page">
        <div className="container">
          <div className="submit-success card">
            <div className="success-icon">🎉</div>
            <h2>Event Submitted!</h2>
            <p>Thanks for submitting your event. It'll appear on the calendar for the Central Florida community to discover.</p>
            <button className="btn btn-primary" onClick={() => setStatus('idle')}>Submit Another Event</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="submit-page">
      <div className="container">
        <div className="submit-intro">
          <h1 className="section-title">Submit Your Event</h1>
          <p className="section-subtitle">
            Share your Central Florida event with the community. It'll appear on our events calendar for free.
          </p>
        </div>

        <div className="submit-layout">
          <form className="submit-form card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name <span className="required">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Downtown Orlando Art Walk"
                required
                maxLength={150}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input type="date" value={form.date} onChange={set('date')} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={form.time} onChange={set('time')} />
                <span className="hint">Optional — leave blank if all day</span>
              </div>
            </div>

            <div className="form-group">
              <label>Location <span className="required">*</span></label>
              <input
                type="text"
                value={form.location}
                onChange={set('location')}
                placeholder="e.g. Lake Eola Park, Orlando FL"
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Tell us about your event — what to expect, who it's for, etc."
                maxLength={800}
                rows={4}
              />
              <span className="hint">{form.description.length}/800 characters</span>
            </div>

            <div className="form-group">
              <label>Event Link</label>
              <input
                type="url"
                value={form.link}
                onChange={set('link')}
                placeholder="https://eventbrite.com/..."
              />
              <span className="hint">Optional — website, Eventbrite, Facebook event, etc.</span>
            </div>

            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={set('contact_email')}
                placeholder="your@email.com"
              />
              <span className="hint">Optional — in case we need to reach you about your submission</span>
            </div>

            {status === 'error' && (
              <p className="form-error">{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Submitting…</>
              ) : 'Submit Event'}
            </button>
          </form>

          <aside className="submit-sidebar">
            <div className="card sidebar-card">
              <h3>Submission Guidelines</h3>
              <ul>
                <li>Events must be located in Central Florida</li>
                <li>Free and paid events are welcome</li>
                <li>Please include as much detail as possible</li>
                <li>Events appear immediately on the calendar</li>
              </ul>
            </div>
            <div className="card sidebar-card">
              <h3>Want more exposure?</h3>
              <p>For featured event listings and social media promotion, reach out to us on Instagram.</p>
              <a
                href="https://www.instagram.com/searchcentralfl/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ marginTop: 12 }}
              >
                @searchcentralfl
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
