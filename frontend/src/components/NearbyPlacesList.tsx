import React, { useMemo, useState } from 'react';
import { Star, MapPin, ExternalLink, Navigation } from 'lucide-react';
import type { NearbyPlace } from '../types';

interface NearbyPlacesListProps {
  title: string;
  places: NearbyPlace[];
  provider?: string | null;
  accent: string; // hex colour for the active tab
}

const formatDistance = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);

export const NearbyPlacesList: React.FC<NearbyPlacesListProps> = ({ title, places, provider, accent }) => {
  const [sortBy, setSortBy] = useState<'top' | 'nearest'>('top');
  const hasRatings = places.some((p) => p.rating != null);

  // Backend already returns places ranked by fame (rating weighted by review volume)
  const sorted = useMemo(
    () => (sortBy === 'nearest' ? [...places].sort((a, b) => a.distance_m - b.distance_m) : places),
    [places, sortBy]
  );

  if (places.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-[#182625]/70 border border-[#EDE4CE]/15 text-xs text-[#B8C4C2]">
        No live venue data could be fetched for this area right now. Try refreshing in a moment.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#182625]/70 border border-[#EDE4CE]/15 overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-[#EDE4CE]/10">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#FAF6ED] font-['Fraunces'] truncate">{title}</p>
          <p className="text-[10px] text-[#B8C4C2] font-mono uppercase tracking-wider">
            Live · {provider || 'unknown source'}
            {!hasRatings && ' · ratings available with Google Places key'}
          </p>
        </div>
        <div className="flex shrink-0 rounded-lg border border-[#EDE4CE]/20 overflow-hidden text-[11px] font-bold">
          {(['top', 'nearest'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2 py-1 transition-colors ${sortBy === key ? 'text-[#131F1E]' : 'text-[#B8C4C2] hover:text-[#FAF6ED]'}`}
              style={sortBy === key ? { backgroundColor: accent } : undefined}
            >
              {key === 'top' ? (hasRatings ? 'Top rated' : 'Notable') : 'Nearest'}
            </button>
          ))}
        </div>
      </div>

      <ol className="divide-y divide-[#EDE4CE]/10">
        {sorted.map((p, idx) => (
          <li key={p.id || idx} className="px-3.5 py-2.5 flex items-start gap-3 hover:bg-[#1E3230]/60 transition-colors">
            <span
              className="mt-0.5 w-5 h-5 shrink-0 rounded-md text-[11px] font-bold font-mono flex items-center justify-center"
              style={{ backgroundColor: `${accent}33`, color: accent }}
            >
              {idx + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#FAF6ED] truncate">{p.name}</p>
                {p.open_now != null && (
                  <span
                    className={`shrink-0 px-1 rounded text-[9px] font-bold uppercase ${
                      p.open_now ? 'bg-[#8E985A]/25 text-[#D8E8A3]' : 'bg-[#DF795B]/20 text-[#F5B4A3]'
                    }`}
                  >
                    {p.open_now ? 'Open' : 'Closed'}
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-[#B8C4C2]">
                {p.rating != null && (
                  <span className="flex items-center gap-0.5 font-bold text-[#F2C46D]">
                    <Star className="w-3 h-3 fill-current" />
                    {p.rating.toFixed(1)}
                    {p.rating_count != null && (
                      <span className="font-normal text-[#B8C4C2]">({formatCount(p.rating_count)})</span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Navigation className="w-3 h-3" />
                  {formatDistance(p.distance_m)}
                </span>
                {p.price_level != null && p.price_level > 0 && (
                  <span className="font-mono text-[#C1D486]">{'$'.repeat(p.price_level)}</span>
                )}
                {p.category && <span className="truncate">{p.category}</span>}
              </div>

              {p.address && (
                <p className="mt-0.5 text-[11px] text-[#B8C4C2]/70 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {p.address}
                </p>
              )}
            </div>

            {p.maps_url && (
              <a
                href={p.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 p-1 rounded-md text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#1A2827] shrink-0"
                title="Open in maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};
