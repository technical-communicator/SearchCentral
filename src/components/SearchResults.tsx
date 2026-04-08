import { SearchResult } from '../api/search'
import './SearchResults.css'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="results-empty">
        <p>No results found for <strong>"{query}"</strong></p>
        <p className="results-empty__hint">Try different keywords or check your spelling.</p>
      </div>
    )
  }

  return (
    <div className="results">
      <p className="results-count">{results.length} results for "{query}"</p>
      <ul className="results-list">
        {results.map((result, index) => (
          <li key={index} className="result-item">
            <div className="result-item__source">{result.source}</div>
            <a
              className="result-item__title"
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.title}
            </a>
            <div className="result-item__url">{result.url}</div>
            <p className="result-item__snippet">{result.snippet}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
