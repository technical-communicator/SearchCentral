import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Blog.css'

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string | null
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="blog-page">
      <div className="container">
        <div className="blog-header">
          <h1 className="section-title">Blog</h1>
          <p className="section-subtitle">Stories, guides, and highlights from the Central Florida scene.</p>
        </div>

        {loading ? (
          <div className="blog-loading"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card card">
                <div className="blog-card-date">{formatDate(post.created_at)}</div>
                <h2 className="blog-card-title">{post.title}</h2>
                {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                <span className="blog-read-more">Read more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
