import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'searchcentral.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL for better concurrent read performance
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    description TEXT,
    link TEXT,
    contact_email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    excerpt TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS instagram_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general',
    caption TEXT,
    post_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Seed a couple of instagram posts if none exist
const igCount = (db.prepare('SELECT COUNT(*) as c FROM instagram_posts').get() as { c: number }).c
if (igCount === 0) {
  db.prepare(`INSERT INTO instagram_posts (url, category, caption, post_date) VALUES (?, ?, ?, ?)`).run(
    'https://www.instagram.com/p/DWzD7jkFcsL/',
    'events',
    'Events Calendar',
    new Date().toISOString().split('T')[0]
  )
  db.prepare(`INSERT INTO instagram_posts (url, category, caption, post_date) VALUES (?, ?, ?, ?)`).run(
    'https://www.instagram.com/p/DWoowNYjZB0/',
    'film',
    'Film Photos',
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
}

export default db
