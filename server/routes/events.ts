import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

// GET /api/events?month=YYYY-MM
router.get('/', (_req: Request, res: Response) => {
  const events = db.prepare(`
    SELECT id, title, date, time, location, description, link
    FROM events
    ORDER BY date ASC, time ASC
  `).all()
  res.json(events)
})

// POST /api/events — public submission
router.post('/', (req: Request, res: Response) => {
  const { title, date, time, location, description, link, contact_email } = req.body

  if (!title?.trim() || !date?.trim() || !location?.trim()) {
    res.status(400).json({ error: 'title, date, and location are required' })
    return
  }

  // Basic date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'date must be in YYYY-MM-DD format' })
    return
  }

  const result = db.prepare(`
    INSERT INTO events (title, date, time, location, description, link, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    date.trim(),
    time?.trim() || null,
    location.trim(),
    description?.trim() || null,
    link?.trim() || null,
    contact_email?.trim() || null
  )

  res.status(201).json({ id: result.lastInsertRowid })
})

export default router
