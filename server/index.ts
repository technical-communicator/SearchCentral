import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import eventsRouter from './routes/events'
import postsRouter from './routes/posts'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/events', eventsRouter)
app.use('/api/posts',  postsRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Serve static frontend
const pub = path.join(process.cwd(), 'public')
app.use(express.static(pub))

// Blog post pages → blog.html
app.get('/blog/:slug', (_req, res) => {
  res.sendFile(path.join(pub, 'blog.html'))
})

// Fallback
app.get('*', (_req, res) => res.sendFile(path.join(pub, 'index.html')))

app.listen(PORT, () => {
  console.log(`\n  Search Central Florida running at http://localhost:${PORT}\n`)
})
