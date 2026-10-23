# EXPLORIA: System Design & Architecture Document
**An AI Cultural & Culinary Discovery Engine for the Physical World**  
*Solo-Builder Edition — Free-Tier Stack (Local-First, Deploy Later)*

---

## 1. Executive Summary & Positioning
**Positioning:** RAG-grounded GenAI product, not a prompt wrapper — built for Spotify / Pinterest-style consumer product roles, scoped to read well to Big Four / general tech interviewers.

> *"An AI discovery engine that grounds tourist, cultural, and food recommendations in verified sources through retrieval-augmented generation, ranks them geospatially, and clearly separates fact from folklore."*

### Key Talking Points for Technical Interviews:
1. **Epistemic Honesty by Design:** Rather than allowing LLMs to hallucinate mythology as historical fact or flatten sacred traditions into tourist marketing, Exploria introduces an explicit confidence tiering layer (`Verified`, `Documented`, `Local lore`).
2. **Multi-Source Physical World Grounding:** Combines Wikipedia REST APIs, Wikidata entity knowledge graphs, OpenStreetMap Overpass spatial node registries, and culinary venue registries.
3. **Cost-Aware Caching & SLA Optimization:** Disk-based geo-hash / coordinate clustering cache minimizes redundant GenAI API token expenditures, achieving sub-10ms response latencies on repeated neighborhood queries.

---

## 2. End-to-End System Architecture

```
User Clicks Map / Searches Query
         │
         ▼
[1] Reverse Geocoding & Entity Resolution
    ├── Google Geocoding API / OpenStreetMap Nominatim
    └── Wikidata Geo-Entity SPARQL / API Lookup
         │
         ▼
[2] Multi-Source Candidate Document Harvesting (Concurrent)
    ├── Wikipedia REST API (Summary + Descriptive Extracts)
    ├── OpenStreetMap Overpass API (Historic monuments, heritage nodes, architecture)
    └── OSM / Foursquare Registry (Regional cuisine, local eateries, food markets)
         │
         ▼
[3] Document Chunking & Windowing
    └── 500-char sliding window with 70-char overlap & sentence boundary snapping
         │
         ▼
[4] Dense Vector Embeddings & Semantic Retrieval
    ├── Embedding: Gemini text-embedding-004 (768-dim)
    ├── Vector Store: ChromaDB / In-Memory Cosine Similarity Matrix
    └── Top-K Semantic Retrieval per Category:
        ├── Cultural Significance (Top 3 Chunks)
        ├── Tourist Highlights (Top 3 Chunks)
        └── Food Recommendations (Top 3 Chunks)
         │
         ▼
[5] Parallel Structured GenAI Generation (JSON Mode)
    ├── Gemini 2.5 Flash / 1.5 Flash with Epistemic Prompting
    └── Enforces Schema: headline, narrative text, confidence tier, rationale, citations
         │
         ▼
[6] Geo-Clustering Disk Cache & Metrics Tracking
    ├── Lat/Lng 2-decimal rounded storage (~1.1km neighborhood resolution)
    └── Real-time metrics: Cache Hit Ratio, Average Latency (ms), Cost Saved ($)
         │
         ▼
[7] React UI Animated Presentation
    ├── Dark Cartography (CartoDB / OpenStreetMap / Google Maps JS API)
    ├── Pulsating Radar Ping & Staggered Motion Cards
    └── Interactive RAG Pipeline Evidence Inspector
```

---

## 3. Epistemic Confidence Layer (Key Differentiator)

| Confidence Tier | Criteria | Sources Backing | UI Representation |
| :--- | :--- | :--- | :--- |
| **Verified** | Hard historical dates, architectural measurements, UNESCO listings, legal designations, official municipal records. | Official gazetteers, government registries, verified spatial nodes. | Neon Emerald glow, Shield Check icon, high-certainty badge. |
| **Documented** | Historical chronicles, secondary literature, travelogues, colonial surveys, academic archives with recorded variance. | Wikipedia extracts, secondary history journals, heritage compendiums. | Sky Blue glow, Book Open icon, archival badge. |
| **Local Lore** | Oral folklore, spiritual beliefs, origin myths, ghost stories, neighborhood traditions, sacred folklore. | Cultural narratives, local oral traditions, community folklore. | Amethyst Purple glow, Sparkles/Flame icon, lore badge. |

---

## 4. Verified Free-Tier Reality Matrix

| Layer | Provider | Free-Tier Limits & Strategy |
| :--- | :--- | :--- |
| **LLM Generation** | Google Gemini (AI Studio Key) | Free tier on `gemini-2.5-flash` and `gemini-1.5-flash` with generous RPM/RPD quotas. Protected by disk cache & rate limiting. |
| **Dense Embeddings** | Gemini `text-embedding-004` | Free via same Google AI Studio key; zero local GPU overhead. |
| **Maps & Cartography** | OpenStreetMap / CartoDB (Default) + Google Maps JS API (Optional) | OSM/Leaflet is 100% free with no credit card required. Google Maps JS gives 10k free loads/mo per SKU if key supplied. |
| **Spatial POI & Food** | Wikipedia + OpenStreetMap Overpass | 100% free, public APIs, no card required. |
| **Nearby Food & Tourist Lists** | Google Places (optional) → Geoapify Places → OSM Overpass | Google adds ratings when keyed. Geoapify is free with no card (3,000 credits/day) and returns real venues + distances; Overpass is the keyless last resort. |
| **Vector DB** | Chroma (Local dev) / Supabase pgvector (Deploy) | Zero infrastructure cost for local MVP. |
| **Rate Limiter** | SlowAPI (FastAPI) | Restricts client to 120 req/min to prevent quota exhaustion during live public demos. |

---

## 5. Phased Roadmap (Knowing What NOT to Build First)

- **Phase 1 (Shipped MVP):** Interactive map click-to-discover, reverse geocoding, multi-source RAG harvesting, Gemini structured generation, epistemic confidence labeling, disk response cache, RAG inspector drawer.
- **Phase 2 (Roadmap):** Multimodal image-to-place understanding via Gemini Vision (upload a photo of a monument to identify and pull lore); personalized taste preference filtering.
- **Phase 3 (Roadmap):** Multilingual localized narration; AI Audio Walking Tours with turn-by-turn geospatial routing; Time-Travel Mode (explore a city at different historical centuries).
