import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Sparkles } from 'lucide-react';
import type { SearchLocationSuggestion } from '../types';

interface SearchBarProps {
  onSelectLocation: (lat: number, lng: number, name: string) => void;
  isLoading: boolean;
}

const PRESET_PLACES = [
  { name: 'Kyoto, Japan', emoji: '⛩️', lat: 35.0116, lng: 135.7681 },
  { name: 'Varanasi, India', emoji: '🕯️', lat: 25.3176, lng: 82.9739 },
  { name: 'Oaxaca, Mexico', emoji: '🌶️', lat: 17.0732, lng: -96.7266 },
  { name: 'Edinburgh Castle, UK', emoji: '🏰', lat: 55.9486, lng: -3.1999 },
  { name: 'Mont Saint-Michel, France', emoji: '🌊', lat: 48.6360, lng: -1.5115 },
  { name: 'Athens, Greece', emoji: '🏛️', lat: 37.9715, lng: 23.7257 },
  { name: 'Istanbul, Turkey', emoji: '🕌', lat: 41.0082, lng: 28.9784 }
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectLocation, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchLocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (resp.ok) {
          const data = await resp.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (lat: number, lng: number, name: string) => {
    onSelectLocation(lat, lng, name);
    setQuery(name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-20">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-[#131F1E]/95 backdrop-blur-xl border border-[#EDE4CE]/25 rounded-2xl shadow-xl transition-all focus-within:border-[#DE9B35] focus-within:ring-2 focus-within:ring-[#DE9B35]/30">
        <div className="pl-4 pr-2 text-[#DF795B]">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-[#DE9B35] animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-[#DF795B]" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any historic quarter, monument, or world city..."
          className="w-full py-3 pr-10 bg-transparent text-sm text-[#FAF6ED] placeholder-[#8E9E9B] focus:outline-none font-medium"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="p-1.5 mr-2 text-[#8E9E9B] hover:text-[#FAF6ED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#142221]/98 backdrop-blur-2xl border border-[#EDE4CE]/25 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#EDE4CE]/15">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item.latitude, item.longitude, item.name)}
              className="w-full px-4 py-2.5 text-left hover:bg-[#1E3230]/95 transition-colors flex items-start gap-3 group"
            >
              <MapPin className="w-4 h-4 text-[#DE9B35] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#FAF6ED] truncate font-['Fraunces']">{item.name}</p>
                <p className="text-xs text-[#B8C4C2] truncate">{item.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Curated Preset Chips */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-[#EDE4CE] shrink-0 flex items-center gap-1 mr-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#DE9B35]" />
          Curated:
        </span>
        {PRESET_PLACES.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelect(p.lat, p.lng, p.name)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-[#1A2928]/90 hover:bg-[#233735] border border-[#EDE4CE]/25 hover:border-[#DE9B35] text-[#FAF6ED] text-xs font-semibold transition-all flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span>{p.emoji}</span>
            <span>{p.name.split(',')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
