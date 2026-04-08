import express from 'express'
import cors from 'cors'
import { createSearchRouter } from './routes/search'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/search', createSearchRouter())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`SearchCentral API running on http://localhost:${PORT}`)
})

export default app
