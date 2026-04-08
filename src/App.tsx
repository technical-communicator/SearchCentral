import { useState } from 'react'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import { SearchResult, searchWeb } from './api/search'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (q: string) => {
    if (!q.trim()) return
    setQuery(q)
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const data = await searchWeb(q)
      setResults(data)
    } catch {
      setError('Something went wrong. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className={`app-header ${hasSearched ? 'app-header--compact' : ''}`}>
        <div className="logo">
          <span className="logo-search">Search</span>
          <span className="logo-central">Central</span>
        </div>
        {!hasSearched && (
          <p className="tagline">Your unified search hub</p>
        )}
        <SearchBar onSearch={handleSearch} initialQuery={query} />
      </header>

      <main className="app-main">
        {loading && (
          <div className="status-message">
            <div className="spinner" />
            <span>Searching...</span>
          </div>
        )}
        {error && (
          <div className="status-message status-message--error">{error}</div>
        )}
        {!loading && hasSearched && !error && (
          <SearchResults results={results} query={query} />
        )}
      </main>
    </div>
  )
}

export default App
