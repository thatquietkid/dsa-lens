import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CornerDownLeft, LayoutGrid, Search, Coins } from 'lucide-react';
import { PROBLEM_CATALOG, getProblemMeta } from '../../data/problemCatalog';
import TokenUsageDashboard from '../Adaptive/TokenUsageDashboard';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const meta = useMemo(() => {
    const match = location.pathname.match(/^\/solve\/([^/]+)/);
    return match ? getProblemMeta(match[1]) : null;
  }, [location.pathname]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return PROBLEM_CATALOG;
    return PROBLEM_CATALOG.filter((problem) => {
      const haystack = [problem.title, problem.difficulty, ...problem.topics]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term) || String(problem.number) === term;
    });
  }, [query]);

  useEffect(() => {
    setIsSearchOpen(false);
    setQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openProblem = (id) => {
    setIsSearchOpen(false);
    setQuery('');
    navigate(`/solve/${id}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (results.length > 0) openProblem(results[0].id);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          {!isHome && (
            <Link to="/" className="icon-btn" aria-label="Back to problem list">
              <ArrowLeft size={17} />
            </Link>
          )}

          <Link to="/" className="brand" aria-label="DSA Lens home">
            <span className="brand-mark" aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20" />
              </svg>
            </span>
            <span className="brand-name">
              DSA<span>Lens</span>
            </span>
          </Link>

          {!isHome && meta && (
            <div className="crumb" aria-label="Current problem">
              <span className="crumb-sep">/</span>
              <span className="crumb-number">{meta.number}.</span>
              <span className="crumb-title">{meta.title}</span>
            </div>
          )}
        </div>

        <div className="topbar-center" ref={searchRef}>
          <form
            className={`search-box ${isSearchOpen ? 'is-open' : ''}`}
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <Search size={15} className="search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search problems"
              aria-label="Search problems"
              autoComplete="off"
              spellCheck="false"
            />
            <kbd className="search-kbd">Ctrl K</kbd>
          </form>

          {isSearchOpen && (
            <div className="search-results" role="listbox" aria-label="Problem results">
              <div className="search-results-label">
                <span>Problems</span>
                <span className="search-results-count">{results.length}</span>
              </div>

              {results.map((problem) => (
                <button
                  key={problem.id}
                  type="button"
                  className="search-result"
                  role="option"
                  aria-selected="false"
                  onClick={() => openProblem(problem.id)}
                >
                  <span className="search-result-number">{problem.number}.</span>
                  <span className="search-result-title">{problem.title}</span>
                  <span className={`diff ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </button>
              ))}

              {results.length === 0 && (
                <div className="search-empty">No problems match “{query.trim()}”.</div>
              )}

              <div className="search-results-foot">
                <span>Open</span>
                <span className="search-enter">
                  <CornerDownLeft size={11} /> Enter
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="ghost-link"
            onClick={() => setShowTokens(true)}
            title="AI Mentor Token Budget & API Settings"
          >
            <Coins size={14} />
            <span>AI Budget</span>
          </button>
          <span className="topbar-divider" aria-hidden="true" />
          {isHome ? (
            <span className="engine-status">
              <span className="status-dot" />
              Runs locally
            </span>
          ) : (
            <Link to="/" className="ghost-link">
              <LayoutGrid size={15} />
              Problems
            </Link>
          )}
          <span className="topbar-divider" aria-hidden="true" />
          <span className="avatar" title="Profile">
            NC
          </span>
        </div>
      </div>
      <TokenUsageDashboard isOpen={showTokens} onClose={() => setShowTokens(false)} />
    </header>
  );
};

export default Header;
