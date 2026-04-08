import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import eventsRouter from './routes/events'
import postsRouter from './routes/posts'
import instagramRouter from './routes/instagram'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/events', eventsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/instagram', instagramRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(process.cwd(), 'dist', 'client')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Search Central Florida API running on http://localhost:${PORT}`)
})

export default app
