import { Router, Request, Response } from 'express'

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export function createSearchRouter(): Router {
  const router = Router()

  router.get('/', async (req: Request, res: Response) => {
    const query = req.query.q as string | undefined

    if (!query || !query.trim()) {
      res.status(400).json({ error: 'Query parameter "q" is required' })
      return
    }

    try {
      const results = await performSearch(query.trim())
      res.json(results)
    } catch (err) {
      console.error('Search error:', err)
      res.status(500).json({ error: 'Search failed' })
    }
  })

  return router
}

async function performSearch(query: string): Promise<SearchResult[]> {
  // Placeholder: returns mock results.
  // Replace this with real search provider integrations (e.g. Brave Search, SerpAPI, Bing).
  const mockResults: SearchResult[] = [
    {
      title: `Results for "${query}" - Example Site`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a placeholder result for your query "${query}". Integrate a real search provider to show live results.`,
      source: 'Example',
    },
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `Wikipedia article related to "${query}". Connect a search API to display real web results.`,
      source: 'Wikipedia',
    },
    {
      title: `${query} documentation`,
      url: `https://docs.example.com/${encodeURIComponent(query)}`,
      snippet: `Documentation and guides related to "${query}". Add your search provider API key in .env to enable live search.`,
      source: 'Docs',
    },
  ]

  return mockResults
}
