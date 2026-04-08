export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }
  return response.json()
}
