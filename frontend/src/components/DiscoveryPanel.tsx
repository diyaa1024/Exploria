import React, { useState } from 'react';
import {
  Landmark,
  Compass,
  UtensilsCrossed,
  Sparkles,
  Zap,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  X,
  ChevronRight,
  Database
} from 'lucide-react';
import type { PlaceResponse, ClaimItem } from '../types';
import { ClaimCard } from './ClaimCard';
import { NearbyPlacesList } from './NearbyPlacesList';

interface DiscoveryPanelProps {
  data: PlaceResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClose?: () => void;
  onOpenInspector: () => void;
}

export const DiscoveryPanel: React.FC<DiscoveryPanelProps> = ({
  data,
  isLoading,
  onRefresh,
  onClose,
  onOpenInspector
}) => {
  const [activeTab, setActiveTab] = useState<'cultural_significance' | 'tourist_highlights' | 'food_recommendations'>('cultural_significance');

  const tabs = [
    {
      id: 'cultural_significance' as const,
      label: 'Cultural Significance',
      icon: <Landmark className="w-4 h-4" />,
      color: 'text-[#DF795B]',
      activeClass: 'border-[#DF795B] text-[#FAF6ED] bg-[#DF795B]/15'
    },
    {
      id: 'tourist_highlights' as const,
      label: 'Tourist Highlights',
      icon: <Compass className="w-4 h-4" />,
      color: 'text-[#DE9B35]',
      activeClass: 'border-[#DE9B35] text-[#FAF6ED] bg-[#DE9B35]/15'
    },
    {
      id: 'food_recommendations' as const,
      label: 'Food & Culinary',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      color: 'text-[#567D77]',
      activeClass: 'border-[#567D77] text-[#FAF6ED] bg-[#567D77]/25'
    }
  ];

  // Render Shimmering Loading Skeletons
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#131F1E]/98 backdrop-blur-2xl border-l border-[#EDE4CE]/20 p-5 overflow-y-auto">
        <div className="animate-pulse space-y-3.5 mb-5">
          <div className="h-4 bg-[#1B2928] rounded-full w-24" />
          <div className="h-7 bg-[#1B2928] rounded-xl w-3/4" />
          <div className="h-4 bg-[#1B2928]/60 rounded w-1/2" />
          <div className="h-10 bg-[#1B2928]/40 rounded-xl w-full" />
        </div>

        <div className="flex gap-2 mb-5 animate-pulse">
          <div className="h-10 bg-[#1B2928] rounded-xl flex-1" />
          <div className="h-10 bg-[#1B2928] rounded-xl flex-1" />
          <div className="h-10 bg-[#1B2928] rounded-xl flex-1" />
        </div>

        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#182625]/70 border border-[#EDE4CE]/15 space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-[#1B2928] rounded w-1/2" />
                <div className="h-5 bg-[#1B2928] rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-[#1B2928]/60 rounded w-full" />
                <div className="h-3.5 bg-[#1B2928]/60 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback empty view if no data selected
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-[#131F1E]/98 backdrop-blur-2xl border-l border-[#EDE4CE]/20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1B2928] border border-[#EDE4CE]/20 flex items-center justify-center mb-4 text-[#DE9B35] shadow-lg">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '60s' }} />
        </div>
        <h3 className="text-xl font-bold text-[#FAF6ED] font-['Fraunces']">Select an Atlas Quarter</h3>
        <p className="text-sm text-[#B8C4C2] mt-2 max-w-xs leading-relaxed">
          Click anywhere on the physical cartography or search a city to synthesize historical, architectural, and culinary lore.
        </p>
      </div>
    );
  }

  // Active claims array
  const claims: ClaimItem[] = data.categories?.[activeTab]?.claims || [];

  // Epistemic stats
  const verifiedCount = data.epistemic_stats?.Verified ?? 0;
  const docCount = data.epistemic_stats?.Documented ?? 0;
  const loreCount = data.epistemic_stats?.['Local lore'] ?? 0;

  return (
    <div className="flex flex-col h-full bg-[#131F1E]/98 backdrop-blur-2xl border-l border-[#EDE4CE]/20 overflow-hidden shadow-2xl">
      {/* Top Sticky Header */}
      <div className="px-5 pt-4 pb-3 border-b border-[#EDE4CE]/15 bg-[#131F1E]/95 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#DE9B35] flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-[#DE9B35]" />
                Cartographic Synthesis
              </span>

              {data.cached && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8E985A]/20 text-[#C1D486] border border-[#8E985A]/40 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#8E985A]" />
                  Cached ({data.latency_ms}ms)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#FAF6ED] truncate font-['Fraunces'] tracking-tight">
              {data.place_name}
            </h2>

            <p className="text-xs text-[#B8C4C2] truncate font-medium mt-0.5">
              {data.formatted_address || [data.country].filter(Boolean).join(' • ') || `${data.latitude.toFixed(4)}°N, ${data.longitude.toFixed(4)}°E`}
            </p>
          </div>

          {/* Action Buttons: Refresh & Close */}
          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#1A2827] border border-[#EDE4CE]/20 transition-all active:scale-95"
              title="Force re-synthesis via Gemini & Live Sources"
            >
              <RefreshCw className="w-4 h-4 text-[#DE9B35]" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#1A2827] border border-[#EDE4CE]/20 transition-all md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Epistemic Honesty Breakdown Strip */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#182625]/90 border border-[#EDE4CE]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#FAF6ED]">
            <ShieldCheck className="w-4 h-4 text-[#8E985A]" />
            <span className="font-['Fraunces']">Grounding Integrity:</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold font-mono">
            <span className="px-1.5 py-0.5 rounded bg-[#8E985A]/20 text-[#D8E8A3] border border-[#8E985A]/40" title="Verified Facts">
              {verifiedCount} Verified
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#567D77]/25 text-[#A2DDD7] border border-[#567D77]/50" title="Documented History">
              {docCount} Doc
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#DF795B]/25 text-[#F5B4A3] border border-[#DF795B]/50" title="Oral Lore">
              {loreCount} Lore
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-1.5 mt-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-2 px-2 rounded-xl font-bold text-xs sm:text-xs transition-all flex items-center justify-center gap-1.5 border
                  ${isActive
                    ? `${tab.activeClass} shadow-md`
                    : 'bg-[#182625]/50 border-[#EDE4CE]/15 text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#1A2827]'
                  }
                `}
              >
                <span className={isActive ? 'text-[#FAF6ED]' : tab.color}>{tab.icon}</span>
                <span className="truncate">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Claims List View */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
        {activeTab === 'food_recommendations' && (
          <NearbyPlacesList
            title="Famous Dining Spots Nearby"
            places={data.nearby_places?.food ?? []}
            provider={data.nearby_provider}
            accent="#7FB3AB"
          />
        )}
        {activeTab === 'tourist_highlights' && (
          <NearbyPlacesList
            title="Top Attractions Nearby"
            places={data.nearby_places?.tourist ?? []}
            provider={data.nearby_provider}
            accent="#DE9B35"
          />
        )}

        {claims.length > 0 ? (
          claims.map((claim: ClaimItem, idx: number) => (
            <ClaimCard key={idx} claim={claim} index={idx} />
          ))
        ) : (
          <div className="text-center py-12 text-[#B8C4C2]">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#DE9B35]/60" />
            <p className="text-sm font-medium">No synthesized entries for this domain.</p>
          </div>
        )}

        {/* Bottom Vector Inspector CTA Banner */}
        <div className="pt-2">
          <button
            onClick={onOpenInspector}
            className="w-full p-3.5 rounded-xl bg-[#182625] hover:bg-[#1E3230] border border-[#EDE4CE]/20 text-[#FAF6ED] text-xs font-bold transition-all flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#DE9B35]" />
              <div className="text-left">
                <p className="text-xs font-bold text-[#FAF6ED]">Verify Vector Context Chunks</p>
                <p className="text-[11px] text-[#B8C4C2] font-normal">Inspect Nominatim, OSM, Wikipedia embeddings</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#DE9B35] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
