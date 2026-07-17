import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchSite } from '../data/navigation.js';
import { trackEvent } from '../utils/analytics.js';

export default function SiteSearch({
  id = 'site-search',
  className = '',
  placeholder = 'Search plans, guides, tools...',
  maxResults = 7,
  onNavigate,
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const results = useMemo(() => searchSite(query, maxResults), [query, maxResults]);
  const trimmedQuery = query.trim();
  const showResults = focused && (trimmedQuery.length > 1 || results.length > 0);

  function handleSubmit(event) {
    event.preventDefault();
    const firstResult = trimmedQuery.length > 1 ? results[0] : null;
    const destination = firstResult
      ? firstResult.to
      : trimmedQuery
        ? `/browse?search=${encodeURIComponent(trimmedQuery)}`
        : '/browse';

    trackEvent('site_search_submitted', {
      query: cleanSearchQuery(trimmedQuery),
      result_count: results.length,
      destination,
      search_surface: id,
    });

    if (firstResult) {
      navigate(firstResult.to);
    } else if (trimmedQuery) {
      navigate(`/browse?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      navigate('/browse');
    }

    setFocused(false);
    onNavigate?.();
  }

  function handleResultClick(result) {
    trackEvent('site_search_result_click', {
      query: cleanSearchQuery(trimmedQuery),
      result_title: result.title,
      result_type: result.type,
      destination: result.to,
      search_surface: id,
    });
    setFocused(false);
    onNavigate?.();
  }

  return (
    <form className={`site-search ${className}`.trim()} role="search" onSubmit={handleSubmit}>
      <label className="site-search-field" htmlFor={id}>
        <span className="sr-only">Search MealPrep</span>
        <input
          id={id}
          value={query}
          onChange={event => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={placeholder}
          type="search"
          autoComplete="off"
        />
      </label>
      <button className="site-search-submit" type="submit">Search</button>

      {showResults && (
        <div className="site-search-results" role="listbox" aria-label="Search suggestions">
          {results.length > 0 ? (
            results.map(result => (
              <Link
                key={result.to}
                to={result.to}
                className="site-search-result"
                role="option"
                onMouseDown={event => event.preventDefault()}
                onClick={() => handleResultClick(result)}
              >
                <span className="site-search-result-type">{result.type}</span>
                <strong>{result.title}</strong>
                {result.description && <small>{result.description}</small>}
              </Link>
            ))
          ) : (
            <Link
              to={`/browse?search=${encodeURIComponent(trimmedQuery)}`}
              className="site-search-result"
              role="option"
              onMouseDown={event => event.preventDefault()}
              onClick={() => handleResultClick({
                title: `Search plans for ${trimmedQuery}`,
                type: 'Browse',
                to: `/browse?search=${encodeURIComponent(trimmedQuery)}`,
              })}
            >
              <span className="site-search-result-type">Browse</span>
              <strong>Search plans for "{trimmedQuery}"</strong>
              <small>Use the full plan browser with filters.</small>
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

function cleanSearchQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
}
