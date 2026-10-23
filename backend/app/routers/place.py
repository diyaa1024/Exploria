import asyncio
import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from app.config import settings
from app.models.schemas import (
    PlaceRequest,
    PlaceResponse,
    SearchLocationSuggestion,
    MetricsResponse,
    RAGChunk
)
from app.services import (
    geocoding_service,
    data_fetcher_service,
    rag_engine,
    generator_service,
    cache_service,
    places_service
)

router = APIRouter()

@router.post("/place", response_model=PlaceResponse)
async def get_or_discover_place(req: PlaceRequest):
    """
    Core RAG-grounded discovery pipeline.
    Reverse geocodes, fetches multi-source documents, chunks & embeds,
    retrieves top-k context, and synthesizes 3 epistemically verified categories.
    """
    start_time = time.time()
    lat = req.latitude
    lng = req.longitude

    # 1. Check disk-based response cache
    if not req.force_refresh:
        cached_payload = cache_service.get(lat, lng)
        # Entries cached before live nearby-places support, or while every provider
        # was failing (empty lists), are treated as misses so they get re-fetched
        if cached_payload and any((cached_payload.get("nearby_places") or {}).values()):
            latency_ms = round((time.time() - start_time) * 1000, 2)
            cache_service.record_query(is_hit=True, latency_ms=latency_ms)
            cached_resp = PlaceResponse(**cached_payload)
            cached_resp.cached = True
            cached_resp.latency_ms = latency_ms
            return cached_resp

    # 2. Reverse geocoding & Wikidata entity lookup
    geo_data = await geocoding_service.reverse_geocode(lat, lng)
    place_name = req.place_name or geo_data.get("place_name", "Discovery Point")
    formatted_address = geo_data.get("formatted_address", f"{lat:.4f}, {lng:.4f}")
    country = geo_data.get("country", "")

    wiki_entity = await geocoding_service.lookup_wikidata_entity(lat, lng, place_name)
    wiki_title = wiki_entity.get("wikipedia_title") if wiki_entity else place_name

    # 3. Fetch candidate documents from multiple independent sources in parallel
    wiki_docs_task = data_fetcher_service.fetch_wikipedia(place_name, lat, lng, wiki_title=wiki_title)
    osm_poi_task = data_fetcher_service.fetch_osm_pois_and_culture(lat, lng)
    nearby_task = places_service.fetch_nearby(lat, lng)

    wiki_docs, osm_pois, nearby_result = await asyncio.gather(
        wiki_docs_task, osm_poi_task, nearby_task, return_exceptions=True
    )

    if isinstance(nearby_result, tuple):
        nearby_places, nearby_provider = nearby_result
    else:
        print(f"Nearby places fetch failed: {nearby_result}")
        nearby_places, nearby_provider = {"food": [], "tourist": []}, None

    all_raw_docs = []
    if isinstance(wiki_docs, list):
        all_raw_docs.extend(wiki_docs)
    if isinstance(osm_pois, list):
        all_raw_docs.extend(osm_pois)
    for kind in ("food", "tourist"):
        doc = places_service.to_rag_document(kind, nearby_places.get(kind, []), lat, lng, nearby_provider or "")
        if doc:
            all_raw_docs.append(doc)

    # 4. Chunk fetched documents
    all_chunks = rag_engine.chunk_documents(all_raw_docs)

    # If no chunks retrieved (e.g. middle of ocean or network failure), create fallback seed
    if not all_chunks:
        all_chunks = [
            RAGChunk(
                source="Geographic Coordinates",
                title=f"Coordinates {lat:.3f}, {lng:.3f}",
                content=f"{place_name} situated at coordinates latitude {lat:.4f} and longitude {lng:.4f} in {country}."
            )
        ]

    # 5. Semantic retrieval: top-k chunks per category
    cultural_chunks_task = rag_engine.retrieve_top_k_chunks(
        all_chunks,
        query=f"cultural significance, ancient origins, spiritual traditions, rituals, sacred history of {place_name}",
        k=3,
        category="cultural"
    )
    tourist_chunks_task = rag_engine.retrieve_top_k_chunks(
        all_chunks,
        query=f"famous tourist highlights, architectural landmarks, historic quarters, monuments, panoramic viewpoints in {place_name}",
        k=3,
        category="tourist"
    )
    food_chunks_task = rag_engine.retrieve_top_k_chunks(
        all_chunks,
        query=f"culinary specialties, traditional food, signature regional dishes, authentic local eateries and restaurants in {place_name}",
        k=3,
        category="food"
    )

    cultural_chunks, tourist_chunks, food_chunks = await asyncio.gather(
        cultural_chunks_task, tourist_chunks_task, food_chunks_task
    )

    # 6. Synthesize categories with Gemini structured prompts
    cultural_res_task = generator_service.generate_category("cultural_significance", place_name, country, cultural_chunks)
    tourist_res_task = generator_service.generate_category("tourist_highlights", place_name, country, tourist_chunks)
    food_res_task = generator_service.generate_category("food_recommendations", place_name, country, food_chunks)

    cultural_res, tourist_res, food_res = await asyncio.gather(
        cultural_res_task, tourist_res_task, food_res_task
    )

    categories = {
        "cultural_significance": cultural_res,
        "tourist_highlights": tourist_res,
        "food_recommendations": food_res
    }

    # 7. Calculate Epistemic Confidence breakdown
    stats = {"Verified": 0, "Documented": 0, "Local lore": 0}
    for cat in categories.values():
        for claim in cat.claims:
            conf_val = claim.confidence.value if hasattr(claim.confidence, "value") else str(claim.confidence)
            if conf_val in stats:
                stats[conf_val] += 1
            else:
                stats[conf_val] = 1

    latency_ms = round((time.time() - start_time) * 1000, 2)
    place_id = f"{round(lat, 3)}_{round(lng, 3)}"

    response = PlaceResponse(
        place_id=place_id,
        place_name=place_name,
        formatted_address=formatted_address,
        country=country,
        latitude=lat,
        longitude=lng,
        categories=categories,
        cached=False,
        generated_at=datetime.now(timezone.utc).isoformat(),
        latency_ms=latency_ms,
        rag_chunks_used=len(all_chunks),
        epistemic_stats=stats,
        nearby_places=nearby_places,
        nearby_provider=nearby_provider,
        rag_debug_chunks=(cultural_chunks + tourist_chunks + food_chunks)[:6]
    )

    # 8. Record in cache & metrics
    cache_service.set(lat, lng, response.model_dump())
    cache_service.record_query(is_hit=False, latency_ms=latency_ms, chunks_processed=len(all_chunks))

    return response

@router.get("/search", response_model=list[SearchLocationSuggestion])
async def search_places(q: str = Query(..., min_length=2)):
    """
    Search places and landmarks for dynamic map navigation.
    """
    return await geocoding_service.search_places(q)

@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Returns live production-grade caching and latency metrics.
    """
    data = cache_service.get_metrics()
    return MetricsResponse(**data)

@router.get("/rag-inspect")
async def inspect_rag_pipeline(lat: float, lng: float):
    """
    Interview & Dev inspection endpoint: returns raw fetched chunks and vector scoring.
    """
    geo_data = await geocoding_service.reverse_geocode(lat, lng)
    place_name = geo_data.get("place_name", "Location")

    wiki_docs = await data_fetcher_service.fetch_wikipedia(place_name, lat, lng)
    osm_pois = await data_fetcher_service.fetch_osm_pois_and_culture(lat, lng)
    food_docs = await data_fetcher_service.fetch_food_and_culinary_spots(lat, lng)

    all_raw_docs = (wiki_docs or []) + (osm_pois or []) + (food_docs or [])
    chunks = rag_engine.chunk_documents(all_raw_docs)

    return {
        "location": place_name,
        "coordinates": {"lat": lat, "lng": lng},
        "raw_documents_count": len(all_raw_docs),
        "total_chunks_created": len(chunks),
        "sample_chunks": [c.model_dump() for c in chunks[:8]]
    }

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Exploria Engine",
        "groq_api_configured": bool(settings.GROQ_API_KEY),
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "google_maps_configured": bool(settings.GOOGLE_MAPS_API_KEY),
        "foursquare_configured": bool(settings.FOURSQUARE_API_KEY),
        "geoapify_configured": bool(settings.GEOAPIFY_API_KEY),
        "active_groq_model": settings.GROQ_MODEL,
        "active_gemini_model": settings.GEMINI_MODEL
    }
