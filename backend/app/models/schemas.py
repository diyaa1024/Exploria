from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field

class ConfidenceLevel(str, Enum):
    VERIFIED = "Verified"
    DOCUMENTED = "Documented"
    LOCAL_LORE = "Local lore"

class SourceAttribution(BaseModel):
    title: str
    url: str
    source_type: str = "Wikipedia"  # "Wikipedia", "Wikidata", "OpenTripMap", "Foursquare/OSM"
    snippet: Optional[str] = None

class ClaimItem(BaseModel):
    id: str
    headline: str
    text: str
    confidence: ConfidenceLevel
    confidence_reason: str
    tags: list[str] = Field(default_factory=list)
    sources: list[SourceAttribution] = Field(default_factory=list)
    metadata: Optional[dict[str, Any]] = None

class CategoryResult(BaseModel):
    category: str  # "cultural_significance", "tourist_highlights", "food_recommendations"
    title: str
    summary: str
    claims: list[ClaimItem] = Field(default_factory=list)

class RAGChunk(BaseModel):
    source: str
    title: str
    url: Optional[str] = None
    content: str
    similarity_score: Optional[float] = None
    category_relevance: Optional[str] = None

class NearbyPlace(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    address: Optional[str] = None
    latitude: float
    longitude: float
    distance_m: int
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    price_level: Optional[int] = None  # 0 (free) - 4 (very expensive)
    open_now: Optional[bool] = None
    maps_url: Optional[str] = None
    source: str = "OpenStreetMap"

class PlaceRequest(BaseModel):
    latitude: float
    longitude: float
    place_name: Optional[str] = None
    force_refresh: bool = False

class PlaceResponse(BaseModel):
    place_id: str
    place_name: str
    formatted_address: str
    country: str
    latitude: float
    longitude: float
    categories: dict[str, CategoryResult]
    cached: bool = False
    generated_at: str
    latency_ms: float
    rag_chunks_used: int
    epistemic_stats: dict[str, int] = Field(default_factory=dict)
    nearby_places: dict[str, list[NearbyPlace]] = Field(default_factory=dict)  # "food" / "tourist"
    nearby_provider: Optional[str] = None
    rag_debug_chunks: Optional[list[RAGChunk]] = None

class SearchLocationSuggestion(BaseModel):
    name: str
    display_name: str
    latitude: float
    longitude: float
    type: Optional[str] = None

class MetricsResponse(BaseModel):
    total_queries: int
    cache_hits: int
    cache_misses: int
    cache_hit_ratio: float
    avg_latency_ms: float
    total_rag_chunks_processed: int
    estimated_cost_saved_usd: float
    last_reset: str
