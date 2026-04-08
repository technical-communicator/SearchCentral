import { useState, useEffect } from 'react'
import './Admin.css'

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string | null
  created_at: string
}

interface IgPost {
  id: number
  url: string
  category: string
  caption: string | null
  post_date: string | null
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<'posts' | 'instagram'>('posts')

  async function login(e: React.FormEvent) {
    e.preventDefault()
    // Verify by trying a write — use a lightweight check
    const res = await fetch('/api/posts', {
      method: 'GET',
      headers: { 'x-admin-password': password },
    })
    if (res.ok) {
      setAuthed(true)
      setAuthError('')
    } else {
      setAuthError('Wrong password')
    }
  }

  if (!authed) {
    return (
      <main className="admin-page">
        <div className="container">
          <div className="admin-login card">
            <h1>Admin</h1>
            <p>Enter your admin password to manage content.</p>
            <form onSubmit={login} className="admin-login-form">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {authError && <p className="form-error">{authError}</p>}
              <button type="submit" className="btn btn-primary">Sign In</button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin</h1>
          <button className="btn btn-outline" onClick={() => setAuthed(false)}>Sign Out</button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'posts' ? 'admin-tab--active' : ''}`} onClick={() => setTab('posts')}>Blog Posts</button>
          <button className={`admin-tab ${tab === 'instagram' ? 'admin-tab--active' : ''}`} onClick={() => setTab('instagram')}>Instagram Posts</button>
        </div>

        {tab === 'posts' && <PostsAdmin password={password} />}
        {tab === 'instagram' && <InstagramAdmin password={password} />}
      </div>
    </main>
  )
}

function PostsAdmin({ password }: { password: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [form, setForm] = useState({ title: '', body: '', excerpt: '', published: true })
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/posts', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(setPosts)
      .catch(() => {})
  }, [password])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setPosts(prev => [{ id: data.id, slug: data.slug, title: form.title, excerpt: form.excerpt || null, created_at: new Date().toISOString() }, ...prev])
      setForm({ title: '', body: '', excerpt: '', published: true })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }

  async function deletePost(slug: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${slug}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    setPosts(prev => prev.filter(p => p.slug !== slug))
  }

  return (
    <div className="admin-section">
      <h2>New Blog Post</h2>
      <form className="admin-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Excerpt (shown in blog listing)</label>
          <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Brief summary..." />
        </div>
        <div className="form-group">
          <label>Body (Markdown supported)</label>
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={12}
            required
            placeholder="Write your post here... **bold**, *italic*, # Heading, [link](url)"
          />
        </div>
        <label className="admin-checkbox">
          <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
          Publish immediately
        </label>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : status === 'success' ? 'Saved!' : 'Publish Post'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Existing Posts</h2>
      {posts.length === 0 ? <p style={{ color: 'var(--muted)' }}>No published posts yet.</p> : (
        <ul className="admin-list">
          {posts.map(p => (
            <li key={p.id} className="admin-list-item card">
              <div>
                <strong>{p.title}</strong>
                <span className="admin-slug">/{p.slug}</span>
              </div>
              <button className="admin-delete" onClick={() => deletePost(p.slug)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function InstagramAdmin({ password }: { password: string }) {
  const [posts, setPosts] = useState<IgPost[]>([])
  const [form, setForm] = useState({ url: '', category: 'events', caption: '', post_date: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle')

  useEffect(() => {
    fetch('/api/instagram')
      .then(r => r.json())
      .then(setPosts)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    const res = await fetch('/api/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => [{ id: data.id, ...form, caption: form.caption || null, post_date: form.post_date || null }, ...prev])
      setForm({ url: '', category: 'events', caption: '', post_date: '' })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  async function deletePost(id: number) {
    if (!confirm('Remove this Instagram post?')) return
    await fetch(`/api/instagram/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="admin-section">
      <h2>Add Instagram Post</h2>
      <form className="admin-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Instagram Post URL</label>
          <input
            type="url"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="https://www.instagram.com/p/XXXX/"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="events">Events</option>
              <option value="film">Film Photos</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="form-group">
            <label>Post Date</label>
            <input type="date" value={form.post_date} onChange={e => setForm(f => ({ ...f, post_date: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label>Caption / Label</label>
          <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Short label for this post" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Adding…' : status === 'success' ? 'Added!' : 'Add Post'}
        </button>
      </form>

      <h2 style={{ marginTop: 40 }}>Current Instagram Posts</h2>
      <ul className="admin-list">
        {posts.map(p => (
          <li key={p.id} className="admin-list-item card">
            <div>
              <span className={`tag tag-${p.category}`}>{p.category}</span>
              <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 10, fontSize: '0.9rem' }}>{p.url}</a>
            </div>
            <button className="admin-delete" onClick={() => deletePost(p.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
