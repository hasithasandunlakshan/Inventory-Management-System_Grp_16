'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { AzureSearchService } from '@/lib/services/azureSearchService';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange?: (filters: any) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSearch,
  onFiltersChange,
  placeholder = 'Search products, suppliers, documents...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(AzureSearchService.getRecentSearches());
    setPopularSearches(AzureSearchService.getPopularSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (value: string) => {
    setQuery(value);

    if (value.length > 2) {
      setIsLoading(true);
      try {
        const suggestions = await AzureSearchService.getSuggestions(value);
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      AzureSearchService.saveRecentSearch(searchQuery);
      onSearch(searchQuery);
      setShowSuggestions(false);
      setRecentSearches(AzureSearchService.getRecentSearches());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
        <Input
          ref={inputRef}
          type='text'
          placeholder={placeholder}
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          className='pl-10 pr-10'
        />
        {query && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearSearch}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
        {isLoading && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className='p-2'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2'>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm'
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className='p-2 border-t'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2 flex items-center'>
                <Clock className='h-3 w-3 mr-1' />
                Recent Searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className='w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm'
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && query.length === 0 && (
            <div className='p-2 border-t'>
              <div className='text-xs font-medium text-gray-500 mb-2 px-2 flex items-center'>
                <TrendingUp className='h-3 w-3 mr-1' />
                Popular Searches
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className='w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm'
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* No suggestions message */}
          {suggestions.length === 0 && query.length > 2 && (
            <div className='p-4 text-center text-gray-500 text-sm'>
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
