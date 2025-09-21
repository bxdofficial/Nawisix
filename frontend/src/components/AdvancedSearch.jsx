import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  HashtagIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

const AdvancedSearch = ({
  onSearch,
  searchableFields = ['title', 'description', 'tags'],
  filters = [],
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchMode, setSearchMode] = useState('smart'); // smart, exact, fuzzy
  const [sortBy, setSortBy] = useState('relevance'); // relevance, date, popularity
  
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-complete suggestions based on query
  const autoCompleteSuggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    const allSuggestions = [
      ...suggestions,
      ...searchHistory.slice(0, 5),
      ...popularSearches
    ];
    
    return [...new Set(
      allSuggestions
        .filter(s => s.toLowerCase().includes(queryLower))
        .slice(0, 8)
    )];
  }, [query, suggestions, searchHistory, popularSearches]);

  // Handle search execution
  const executeSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    // Execute search with filters
    onSearch({
      query: searchQuery,
      filters: activeFilters,
      mode: searchMode,
      sortBy,
      fields: searchableFields
    });
    
    setIsOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        searchRef.current?.focus();
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-search on debounced query change
  useEffect(() => {
    if (debouncedQuery && searchMode === 'smart') {
      executeSearch(debouncedQuery);
    }
  }, [debouncedQuery, searchMode]);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
        <span className="text-gray-600 dark:text-gray-400">البحث...</span>
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          executeSearch();
                        }
                      }}
                      placeholder="ابحث عن أي شيء..."
                      className="flex-1 text-lg bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      autoFocus
                    />
                    
                    {/* Search Options */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${
                          showFilters || Object.keys(activeFilters).length > 0
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FunnelIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Mode Selector */}
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-sm text-gray-500">وضع البحث:</span>
                    {['smart', 'exact', 'fuzzy'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSearchMode(mode)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          searchMode === mode
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mode === 'smart' ? 'ذكي' : mode === 'exact' ? 'دقيق' : 'مرن'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters Section */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 space-y-3">
                        {/* Filter Categories */}
                        <div className="flex flex-wrap gap-2">
                          {filters.map((filter) => (
                            <FilterChip
                              key={filter.name}
                              filter={filter}
                              value={activeFilters[filter.name]}
                              onChange={(value) => handleFilterChange(filter.name, value)}
                            />
                          ))}
                        </div>
                        
                        {/* Sort Options */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">ترتيب حسب:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
                          >
                            <option value="relevance">الأكثر صلة</option>
                            <option value="date">الأحدث</option>
                            <option value="popularity">الأكثر شعبية</option>
                            <option value="rating">الأعلى تقييماً</option>
                          </select>
                        </div>
                        
                        {/* Active Filters Display */}
                        {Object.keys(activeFilters).length > 0 && (
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(activeFilters).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                >
                                  {key}: {value}
                                  <button
                                    onClick={() => handleFilterChange(key, null)}
                                    className="ml-1 hover:text-primary-hover"
                                  >
                                    <XMarkIcon className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={clearFilters}
                              className="text-sm text-red-500 hover:text-red-600"
                            >
                              مسح الكل
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Suggestions */}
                <div className="max-h-96 overflow-y-auto">
                  {/* Auto-complete Suggestions */}
                  {isFocused && autoCompleteSuggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-2 py-1">اقتراحات</div>
                      {autoCompleteSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion);
                            executeSearch(suggestion);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-right">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {!query && searchHistory.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs text-gray-500">البحث الأخير</span>
                        <button
                          onClick={clearHistory}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          مسح
                        </button>
                      </div>
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(item);
                            executeSearch(item);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-right">{item}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches */}
                  {!query && popularSearches.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 px-2 py-1">الأكثر بحثاً</div>
                      {popularSearches.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(item);
                            executeSearch(item);
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <FireIcon className="w-4 h-4 text-orange-500" />
                            <span className="flex-1 text-right">{item}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>↵ للبحث</span>
                      <span>ESC للإلغاء</span>
                      <span>↑↓ للتنقل</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      <span>بحث متقدم بالذكاء الاصطناعي</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Filter Chip Component
const FilterChip = ({ filter, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    switch (filter.type) {
      case 'date':
        return CalendarIcon;
      case 'user':
        return UserIcon;
      case 'tag':
        return HashtagIcon;
      case 'category':
        return DocumentIcon;
      default:
        return StarIcon;
    }
  };

  const Icon = getIcon();

  if (filter.type === 'select') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
            value
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{filter.label}</span>
          {value && <span className="text-xs">({value})</span>}
        </button>
        
        {isOpen && (
          <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            {filter.options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filter.type === 'date') {
    return (
      <div className="inline-flex items-center space-x-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => onChange(!value)}
      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
        value
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{filter.label}</span>
    </button>
  );
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default AdvancedSearch;