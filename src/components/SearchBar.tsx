import { useState, FormEvent, useEffect } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    setValue(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__inner">
        <svg className="search-bar__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M13.856 12.442l3.35 3.351-1.414 1.414-3.351-3.35A6.5 6.5 0 1 1 13.856 12.442zM8.5 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"
            fill="currentColor"
          />
        </svg>
        <input
          className="search-bar__input"
          type="search"
          placeholder="Search anything..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="Search query"
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => setValue('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="search-bar__submit">
        Search
      </button>
    </form>
  )
}
