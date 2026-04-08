import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scfl-admin'

function isAdmin(req: Request): boolean {
  return req.headers['x-admin-password'] === ADMIN_PASSWORD
}

// GET /api/instagram
router.get('/', (_req: Request, res: Response) => {
  const posts = db.prepare(`
    SELECT id, url, category, caption, post_date
    FROM instagram_posts
    ORDER BY post_date DESC, created_at DESC
  `).all()
  res.json(posts)
})

// POST /api/instagram — admin only
router.post('/', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { url, category, caption, post_date } = req.body
  if (!url?.trim()) {
    res.status(400).json({ error: 'url is required' })
    return
  }

  const result = db.prepare(`
    INSERT OR IGNORE INTO instagram_posts (url, category, caption, post_date)
    VALUES (?, ?, ?, ?)
  `).run(url.trim(), category?.trim() || 'general', caption?.trim() || null, post_date || null)

  res.status(201).json({ id: result.lastInsertRowid })
})

// DELETE /api/instagram/:id — admin only
router.delete('/:id', (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  db.prepare('DELETE FROM instagram_posts WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
