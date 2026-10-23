export type ConfidenceLevel = 'Verified' | 'Documented' | 'Local lore';

export interface SourceAttribution {
  title: string;
  url: string;
  source_type: string;
  snippet?: string;
}

export interface ClaimItem {
  id: string;
  headline: string;
  text: string;
  confidence: ConfidenceLevel;
  confidence_reason: string;
  tags: string[];
  sources: SourceAttribution[];
  metadata?: Record<string, any>;
}

export interface CategoryResult {
  category: 'cultural_significance' | 'tourist_highlights' | 'food_recommendations' | string;
  title: string;
  summary: string;
  claims: ClaimItem[];
}

export interface RAGChunk {
  source: string;
  title: string;
  url?: string;
  content: string;
  similarity_score?: number;
  category_relevance?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  distance_m: number;
  rating?: number | null;
  rating_count?: number | null;
  price_level?: number | null;
  open_now?: boolean | null;
  maps_url?: string | null;
  source: string;
}

export interface PlaceResponse {
  place_id: string;
  place_name: string;
  formatted_address: string;
  country: string;
  latitude: number;
  longitude: number;
  categories: {
    cultural_significance: CategoryResult;
    tourist_highlights: CategoryResult;
    food_recommendations: CategoryResult;
    [key: string]: CategoryResult;
  };
  cached: boolean;
  generated_at: string;
  latency_ms: number;
  rag_chunks_used: number;
  epistemic_stats: {
    Verified?: number;
    Documented?: number;
    'Local lore'?: number;
    [key: string]: number | undefined;
  };
  nearby_places?: {
    food?: NearbyPlace[];
    tourist?: NearbyPlace[];
  };
  nearby_provider?: string | null;
  rag_debug_chunks?: RAGChunk[];
}

export interface SystemMetrics {
  total_queries: number;
  cache_hits: number;
  cache_misses: number;
  cache_hit_ratio: number;
  avg_latency_ms: number;
  total_rag_chunks_processed: number;
  estimated_cost_saved_usd: number;
  last_reset: string;
}

export interface SearchLocationSuggestion {
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  type?: string;
}
