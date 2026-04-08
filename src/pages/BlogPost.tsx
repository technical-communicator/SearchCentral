import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './BlogPost.css'

interface Post {
  id: number
  slug: string
  title: string
  body: string
  excerpt: string | null
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/posts/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => { if (data) { setPost(data); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <main className="post-page"><div className="container post-loading"><div className="spinner" /></div></main>
  )

  if (notFound) return (
    <main className="post-page">
      <div className="container post-notfound">
        <h1>Post not found</h1>
        <Link to="/blog" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Blog</Link>
      </div>
    </main>
  )

  return (
    <main className="post-page">
      <div className="container">
        <Link to="/blog" className="post-back">← Back to Blog</Link>
        {post && (
          <article className="post-article">
            <header className="post-header">
              <p className="post-date">{formatDate(post.created_at)}</p>
              <h1>{post.title}</h1>
              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            </header>
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body) }}
            />
          </article>
        )}
      </div>
    </main>
  )
}

// Minimal markdown → HTML converter (paragraphs, bold, italic, links, headings)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .split(/\n\n+/)
    .map(block => {
      if (/^<h[123]>/.test(block)) return block
      return `<p>${block.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
}
