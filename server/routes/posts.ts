import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scfl-admin'

function isAdmin(req: Request): boolean {
  return req.headers['x-admin-password'] === ADMIN_PASSWORD
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

// GET /api/posts — public, published only
router.get('/', (_req: Request, res: Response) => {
  const posts = db.prepare(`
    SELECT id, slug, title, excerpt, created_at
    FROM posts
    WHERE published = 1
    ORDER BY created_at DESC
  `).all()
  res.json(posts)
})

// GET /api/posts/:slug
router.get('/:slug', (req: Request, res: Response) => {
  const post = db.prepare(`
    SELECT id, slug, title, body, excerpt, created_at
    FROM posts
    WHERE slug = ? AND published = 1
  `).get(req.params.slug)

  if (!post) {
    res.status(404).json({ error: 'Post not found' })
    return
  }
  res.json(post)
})

// POST /api/posts — admin only
router.post('/', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title, body, excerpt, published } = req.body
  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ error: 'title and body are required' })
    return
  }

  let slug = slugify(title)
  // Ensure slug uniqueness
  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug)
  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  const result = db.prepare(`
    INSERT INTO posts (slug, title, body, excerpt, published)
    VALUES (?, ?, ?, ?, ?)
  `).run(slug, title.trim(), body.trim(), excerpt?.trim() || null, published ? 1 : 0)

  res.status(201).json({ id: result.lastInsertRowid, slug })
})

// PUT /api/posts/:slug — admin only
router.put('/:slug', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title, body, excerpt, published } = req.body
  db.prepare(`
    UPDATE posts SET title = ?, body = ?, excerpt = ?, published = ?, updated_at = datetime('now')
    WHERE slug = ?
  `).run(title, body, excerpt || null, published ? 1 : 0, req.params.slug)

  res.json({ ok: true })
})

// DELETE /api/posts/:slug — admin only
router.delete('/:slug', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  db.prepare('DELETE FROM posts WHERE slug = ?').run(req.params.slug)
  res.json({ ok: true })
})

export default router
