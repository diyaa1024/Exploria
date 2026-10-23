# 🧭 EXPLORIA
### A Real-Time AI Tourism Guide for Anywhere on Earth

Click any point on a world map, or search for a city, and Exploria builds a live guide to that place within seconds:

- **Why it matters culturally:** its history, traditions, beliefs and local lore
- **What to see:** landmarks, historic quarters and viewpoints
- **What to eat:** signature dishes, food culture and real restaurants nearby

Every claim is grounded in live public data and labelled by how trustworthy it is, so travellers can tell a recorded fact from a local legend.

---

## Table of Contents
1. [Business Overview](#1-business-overview)
2. [Product Features](#2-product-features)
3. [How It Works (Architecture)](#3-how-it-works-architecture)
4. [APIs, Data Sources & AI Models](#4-apis-data-sources--ai-models)
5. [Tech Stack](#5-tech-stack)
6. [Backend API Reference](#6-backend-api-reference)
7. [Implementation Plan: Start to Finish](#7-implementation-plan-start-to-finish)
8. [Setup & Running Locally](#8-setup--running-locally)
9. [Configuration Reference](#9-configuration-reference)
10. [Known Limitations](#10-known-limitations)
11. [Roadmap](#11-roadmap)
12. [Summary](#12-summary)

---

## 1. Business Overview

### The problem
Travellers piece together a destination from many disconnected sources: guidebooks, review apps, Wikipedia, blogs and map apps. Each has a gap:

- **Guidebooks** go out of date and only cover famous places.
- **Review apps** (maps, restaurant platforms) say *where* to go, but not *why a place matters*.
- **Generic AI chatbots** answer confidently but often **invent facts**: wrong dates, merged histories, restaurants that don't exist. They also present myths and verified history in the same tone, so readers can't tell them apart.

### The solution
Exploria is a **location-aware discovery engine**. For any coordinate on Earth it:

1. Pulls **real, current information** from open sources (Wikipedia, Wikidata, OpenStreetMap, live places APIs).
2. Uses AI **only to summarise that retrieved evidence**, not to make things up.
3. Labels every statement with an **evidence tier** (the core differentiator):

| Tier | Meaning | Example |
| :--- | :--- | :--- |
| 🟢 **Verified** | Hard facts: dates, measurements, UNESCO listings, official records | "Rebuilt in 1955 after an arson attack" |
| 🔵 **Documented** | Recorded in chronicles, travelogues or archives; details may vary | "Edo-period travellers described tea ceremonies here" |
| 🟣 **Local lore** | Oral tradition, myths, spiritual beliefs, ghost stories | "Foxes are believed to be messengers of the deity Inari" |

### Who it is for
| Segment | Need Exploria meets |
| :--- | :--- |
| **Independent travellers** | A guide for anywhere, including places guidebooks skip |
| **Cultural & heritage tourists** | Depth and context, with folklore kept separate from fact |
| **Food travellers** | Regional dishes plus real, nearby places to eat them |
| **Tour operators & travel platforms** (B2B) | An embeddable "what's special here" layer for itineraries and listings |
| **Education & heritage bodies** | Interactive, source-cited cultural exploration |

### Value proposition
- **Trust:** every claim cites its sources and shows its evidence tier.
- **Coverage:** works for any coordinate on Earth, not a fixed list of cities.
- **Real time:** venue lists and source documents are fetched live, not from a stale database.
- **Low cost to run:** the whole stack runs on **free tiers**, and a cache means a repeat visit to an area costs nothing.

### Unit economics & cost control
| Lever | How it keeps costs down |
| :--- | :--- |
| Free-tier providers | Groq, Gemini, Geoapify, Wikipedia, Wikidata and OpenStreetMap all have free tiers or are free; no credit card needed |
| Geo-cluster cache | Results are stored per ~1.1 km grid cell for 7 days; repeat requests skip every external call |
| Provider fallbacks | If one AI or data provider fails or hits its quota, the next takes over automatically, so the service keeps working |
| Rate limiting | 120 requests/minute per client protects free quotas from abuse |
| Live metrics | `/api/metrics` reports cache hit ratio, average latency and estimated cost saved |

### Possible revenue models (not yet built)
- **Freemium app:** free discovery, with paid offline packs, audio tours and saved itineraries.
- **B2B API / widget:** licensed to travel agencies, hotels and booking platforms.
- **Affiliate commissions:** on restaurant reservations and attraction tickets from the nearby lists.
- **Sponsored, clearly labelled listings:** for local businesses, kept separate from the evidence-tiered content.

### Success metrics (KPIs)
- Time to first result for a new place (target: under 15 s; cached: milliseconds)
- Cache hit ratio (higher means lower cost per user)
- Share of AI responses vs. fallback text (measures AI provider health)
- User engagement: places explored per session, source links clicked

---

## 2. Product Features

| Feature | What the user sees |
| :--- | :--- |
| **Landing page** | An illustrated "atlas" home page with featured destinations (Kyoto, Varanasi, Oaxaca, Edinburgh) |
| **Interactive world map** | Click anywhere to discover it. Three basemaps: Illustrated Atlas (OpenStreetMap), Dark Canvas and Satellite (Esri) |
| **Place search** | Type a city or landmark; autocomplete suggestions fly the map there |
| **Discovery panel** | Three tabs: **Cultural Significance**, **Tourist Highlights** and **Food & Culinary**. Each has 3–4 AI-written claim cards |
| **Claim cards** | Headline, narrative, evidence-tier badge, reason for the rating, tags and clickable source citations |
| **Grounding Integrity strip** | Counts of Verified / Documented / Lore claims for the place |
| **Live nearby lists** | Up to 10 real restaurants and 10 real attractions, with distance, category, address and a map link. Sort by "Notable/Top rated" or "Nearest". Ratings, price level and open-now appear when a Google key is set |
| **Cache indicator & refresh** | Shows when a result came from cache (and how fast); a refresh button forces a fresh build |
| **RAG Evidence Inspector** | A developer view of the exact source passages the AI used and their similarity scores |
| **System Design view** | An in-app architecture explainer |
| **Responsive layout** | Side panel on desktop; slide-up sheet on mobile |

---

## 3. How It Works (Architecture)

```
 User clicks map / searches a place
              │
              ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ [0] Cache check: is this ~1.1 km grid cell cached (<7 days)? │──► yes ──► return in ms
 └─────────────────────────────────────────────────────────────┘
              │ no
              ▼
 [1] Identify the place
     ├─ Reverse geocoding: Google Geocoding (if keyed) → OSM Nominatim → raw coordinates
     └─ Wikidata geo-search → linked English Wikipedia article
              │
              ▼
 [2] Fetch evidence (in parallel)
     ├─ Wikipedia: geo-search nearby articles + page summaries (up to 4)
     ├─ OpenStreetMap Overpass: historic / tourism / heritage / religious sites within 3 km
     └─ Nearby venues: Google Places → Geoapify → OSM Overpass
          (food within 2.5 km, attractions within 5 km)
              │
              ▼
 [3] Chunk documents: ≤500-character passages, 70-character overlap, split at sentence ends
              │
              ▼
 [4] Retrieve: embed passages + 3 category queries (Gemini embeddings,
     local hash vectors as fallback) → cosine similarity → top 3 passages per category
              │
              ▼
 [5] Generate (3 categories in parallel), JSON mode with epistemic prompt
     Groq (gpt-oss-120b) → OpenRouter → Gemini → built-in template text
              │
              ▼
 [6] Assemble response: claims + evidence-tier counts + nearby lists + debug passages
     → save to cache → update metrics → return to the React UI
```

### Step details

**[0] Geo-cluster cache.** Coordinates are rounded to 2 decimal places (~1.1 km), and each cell is stored as a JSON file in `backend/data/cache/` for 7 days (`CACHE_TTL_HOURS=168`). An entry with empty nearby lists is treated as a miss, so a temporary provider outage is not cached for a week. "Refresh" in the UI sends `force_refresh: true` to bypass the cache.

**[1] Place identification.** Reverse geocoding turns coordinates into a place name, address and country. Wikidata finds the closest notable entity and its Wikipedia article, which gives the pipeline the right article even when the place name alone is ambiguous.

**[2] Evidence gathering.** All three sources are queried at once (`asyncio.gather`), so the slowest source sets the wait, not the total of all three. Overpass is queried on **three public mirrors at the same time**, and the first answer wins. If every mirror fails, Overpass is skipped for 10 minutes so later requests don't wait out the same timeouts. The live venue lists are also turned into documents, so the AI writes about restaurants and sites that actually exist.

**Venue ranking:**
- *With ratings* (Google): `rating × log10(review_count + 10)`, so a 4.6 with 3,000 reviews outranks a 5.0 with 4.
- *Without ratings* (Geoapify / OSM): a "notability" score (has a Wikipedia/Wikidata link, a website, opening hours, cuisine or heritage tags) minus a distance penalty.

**[3–4] Retrieval-augmented generation (RAG).** Documents are split into passages and embedded with Gemini `gemini-embedding-001` in a single batched call. Vectors are cached in memory (up to 5,000). If Gemini is unavailable, a deterministic hash-based vector is used instead, so retrieval still works offline. Passages tagged with the matching category get a small similarity bonus (+0.08). Retrieval is in-memory NumPy cosine similarity; no external vector database is needed at this scale.

**[5] AI generation.** Each category gets the 3 best passages, a system prompt defining the three evidence tiers, and a strict JSON schema. The model must return a title, a summary and 3–4 claims, each with headline, text, confidence tier, reason, tags and sources. The three categories are generated concurrently, and each runs through the provider chain on its own:

| Order | Provider | Model | Why |
| :--- | :--- | :--- | :--- |
| 1 | **Groq** | `openai/gpt-oss-120b` (reasoning effort: low) | Fastest. All three categories took ~3.6 s in testing |
| 2 | **OpenRouter** (optional) | `openai/gpt-oss-120b` | Extra backup, only used if a key is set |
| 3 | **Google Gemini** | `gemini-3.8-flash` | Backup. Free tier is limited (20 requests/day per model) |
| 4 | **Built-in templates** | — | Never fails. Builds claims from the fetched Wikipedia/OSM text |

Groq and OpenRouter use the OpenAI-compatible chat-completions API, called directly over `httpx` (no extra SDK). A provider is skipped automatically when its key is missing, and any error (bad key, quota, timeout, invalid JSON) moves on to the next one.

---

## 4. APIs, Data Sources & AI Models

### External APIs
| API | Used for | Key needed? | Free tier | Status in this version |
| :--- | :--- | :--- | :--- | :--- |
| **Groq** | Primary AI text generation | Yes (`GROQ_API_KEY`) | Free, no card | ✅ Configured |
| **OpenRouter** | Secondary AI text generation | Yes (`OPENROUTER_API_KEY`) | Free models available | ⚪ Optional, not set |
| **Google Gemini** | Backup generation + **embeddings** | Yes (`GEMINI_API_KEY`) | Free via AI Studio | ✅ Configured |
| **Wikipedia REST + Action API** | Geo-search of nearby articles, page summaries | No | Free | ✅ Always on |
| **Wikidata API** | Nearest notable entity → Wikipedia link | No | Free | ✅ Always on |
| **OSM Nominatim** | Reverse geocoding, place search | No | Free (fair use) | ✅ Always on |
| **OSM Overpass** (3 mirrors) | Heritage/landmark data, fallback venue lists | No | Free | ✅ Always on |
| **Geoapify Places** | Nearby restaurants & attractions with distances | Yes (`GEOAPIFY_API_KEY`) | 3,000 credits/day, no card | ✅ Configured |
| **Google Places (New) + Geocoding** | Venue ratings, review counts, price, open-now; better geocoding | Yes (`GOOGLE_MAPS_API_KEY`) | Monthly free credit (card required) | ⚪ Optional, not set |
| **Foursquare Places v3** | Restaurant data (developer inspect endpoint only) | Yes (`FOURSQUARE_API_KEY`) | Free tier | ⚪ Optional, not set |
| **Map tiles** (OpenStreetMap, Esri) | Map imagery in the browser | No | Free | ✅ Always on |

### AI models
| Model | Provider | Role | Setting |
| :--- | :--- | :--- | :--- |
| `openai/gpt-oss-120b` | Groq | Main claim generator (JSON mode, temperature 0.3) | `GROQ_MODEL` |
| `openai/gpt-oss-120b` | OpenRouter | Secondary generator | `OPENROUTER_MODEL` |
| `gemini-3.8-flash` | Google | Backup generator | `GEMINI_MODEL` |
| `gemini-embedding-001` | Google | Text embeddings for retrieval | `EMBEDDING_MODEL` |
| Hash vectors (128-dim) | Local | Embedding fallback, works offline | — |

---

## 5. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend framework** | React 19, TypeScript 6, Vite 8 |
| **Styling & motion** | Tailwind CSS 4, Framer Motion, Lucide icons, clsx / tailwind-merge |
| **Maps** | Leaflet + React-Leaflet (OpenStreetMap & Esri tiles) |
| **Backend** | Python 3.11, FastAPI, Uvicorn (fully async) |
| **HTTP client** | httpx (async) for every external API, including Groq/OpenRouter |
| **Validation & settings** | Pydantic v2, pydantic-settings (`.env` loading) |
| **AI SDK** | `google-generativeai` (Gemini generation and embeddings) |
| **Retrieval** | NumPy cosine similarity over an in-memory vector cache |
| **Caching** | JSON files on disk (geo-clustered) + in-memory embedding cache |
| **Rate limiting** | SlowAPI (120 req/min per IP) |
| **Observability** | `X-Process-Time-Ms` header on every response, `/api/metrics`, `/api/health` |
| **Linting** | oxlint (frontend) |
| **Packaging** | Docker (Python 3.11 slim backend; Node 22 build → Nginx frontend with `/api` reverse proxy), Docker Compose |

### Project structure
```
exploria/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, rate limiter, timing middleware
│   │   ├── config.py            # All settings & API keys (from .env)
│   │   ├── models/schemas.py    # Pydantic models: claims, places, responses
│   │   ├── routers/place.py     # /place pipeline, /search, /metrics, /rag-inspect, /health
│   │   └── services/
│   │       ├── geocoding.py      # Google/Nominatim geocoding, Wikidata lookup, search
│   │       ├── data_fetcher.py   # Wikipedia, Overpass (multi-mirror), food registry
│   │       ├── places_service.py # Nearby venues: Google → Geoapify → OSM, ranking
│   │       ├── rag_engine.py     # Chunking, embeddings, top-k retrieval
│   │       ├── generator.py      # AI provider chain + template fallback
│   │       └── cache_service.py  # Geo-cluster disk cache & metrics
│   ├── data/cache/              # Cached place results + metrics (runtime)
│   ├── requirements.txt
│   ├── .env                     # Your API keys (not committed; also used by Docker)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Page state, API calls
│   │   ├── types.ts              # Shared response types
│   │   └── components/           # Landing page, map, search, discovery panel,
│   │                              # claim cards, nearby lists, inspector, system design
│   ├── vite.config.ts            # Dev proxy: /api → localhost:8000
│   ├── nginx.conf                # Production server: static app + /api → backend:8000
│   └── Dockerfile
├── docker-compose.yml            # Runs both containers; reads keys from backend/.env
└── SYSTEM_DESIGN.md
```

---

## 6. Backend API Reference

Base URL: `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/place` | Full discovery pipeline for a coordinate |
| `GET` | `/api/search?q=…` | Place search suggestions (Nominatim, up to 6) |
| `GET` | `/api/metrics` | Cache hit ratio, average latency, passages processed, cost saved |
| `GET` | `/api/rag-inspect?lat=…&lng=…` | Raw fetched documents and passages for debugging |
| `GET` | `/api/health` | Which providers are configured and the active models |

**`POST /api/place` request**
```json
{ "latitude": 22.5726, "longitude": 88.3639, "place_name": "Kolkata", "force_refresh": false }
```

**Response (abridged, illustrative values)**
```json
{
  "place_name": "Kolkata",
  "country": "India",
  "cached": false,
  "latency_ms": 9120.4,
  "epistemic_stats": { "Verified": 5, "Documented": 4, "Local lore": 2 },
  "categories": {
    "food_recommendations": {
      "title": "Kolkata's Iconic Culinary Highlights",
      "summary": "…",
      "claims": [{
        "headline": "Rosogolla: Sweet Heritage Claim",
        "text": "…",
        "confidence": "Verified",
        "confidence_reason": "…",
        "tags": ["Sweets", "GI Tag"],
        "sources": [{ "title": "…", "url": "…", "source_type": "Wikipedia" }]
      }]
    }
  },
  "nearby_places": { "food": [ … ], "tourist": [ … ] },
  "nearby_provider": "Geoapify",
  "rag_debug_chunks": [ … ]
}
```

---

## 7. Implementation Plan: Start to Finish

This is the build sequence that produced the current version, followed by what is needed for production.

### Phase 1: Foundation ✅
- Set up the repo with a FastAPI backend and a React + Vite + TypeScript frontend.
- Centralise settings in `config.py` with `.env` loading via pydantic-settings.
- Define the data contract in `schemas.py`: `ClaimItem`, `CategoryResult`, `PlaceResponse`, and the three-value `ConfidenceLevel` enum.
- Add CORS, SlowAPI rate limiting (120/min) and a request-timing middleware.

### Phase 2: Location intelligence ✅
- Reverse geocoding with Google first and Nominatim as the free fallback.
- Wikidata geo-search to find the right Wikipedia article for a coordinate.
- Place search endpoint for the search bar.

### Phase 3: Evidence harvesting ✅
- Wikipedia geo-search and page summaries.
- OpenStreetMap Overpass queries for historic, tourism, heritage and religious sites.
- Overpass hardening: three mirrors queried at once, first answer wins, 10-minute cooldown when all fail.
- All sources fetched in parallel.

### Phase 4: Retrieval (RAG) ✅
- Chunking with sentence snapping and overlap.
- Batched Gemini embeddings with an in-memory cache.
- Cosine-similarity top-3 retrieval per category with a category-tag bonus.
- Offline hash-vector fallback so retrieval never stops working.

### Phase 5: AI generation with evidence tiers ✅
- System prompt defining Verified / Documented / Local lore, plus a strict JSON output schema.
- Three categories generated concurrently.
- Template-based fallback built from real fetched text, so the app always returns a result.
- **Multi-provider chain: Groq → OpenRouter → Gemini → templates.** Groq replaced Gemini as primary because Gemini was slow and its free daily quota ran out. Generation time fell to about 4 s.

### Phase 6: Live nearby places ✅
- Provider chain: Google Places → Geoapify → OSM Overpass. Each section (food / attractions) is filled independently.
- Ranking by fame score (with ratings) or notability and distance (without).
- Venue lists fed back into the AI context, so food and attraction claims mention real places.

### Phase 7: Caching & observability ✅
- Geo-clustered disk cache (~1.1 km cells, 7-day TTL), ignoring entries with empty venue lists.
- Metrics file with hit ratio, latency and estimated cost saved; `/metrics` and `/health` endpoints.

### Phase 8: Frontend experience ✅
- Atlas-themed landing page with featured destinations.
- Leaflet map with three basemaps, click-to-discover and a radar-ping marker.
- Discovery panel with tabs, claim cards, evidence-tier badges, nearby lists and a refresh button.
- RAG Evidence Inspector and System Design modal.
- Responsive mobile layout.

### Phase 9: Containerisation ✅
- Backend image: Python 3.11 slim running Uvicorn.
- Frontend image: a Node 22 build stage, then Nginx serving the built app and proxying `/api` to the backend container, the same way the Vite dev proxy works locally.
- Docker Compose runs both containers, loads every API key from `backend/.env`, and keeps the cache on the host.
- `.dockerignore` files keep keys, virtualenvs, `node_modules` and cache data out of the images.
- Tested end to end: a fresh place request through `localhost:5173/api` returned Groq-written claims and Geoapify venue lists.

### Phase 10: Production readiness (next)
1. Improve place naming and cultural coverage for small towns (see §10).
2. Move the cache from local JSON files to Redis or a managed database so several server instances can share it.
3. Add automated tests: schema validation of AI output, provider-chain fallback, cache behaviour.
4. Add structured logging and error tracking in place of `print` statements.
5. Deploy the two containers (e.g. Render, Railway, Fly.io or a single VM with Docker Compose), with keys stored as platform secrets instead of a `.env` file.
6. Add analytics for the KPIs in §1.

---

## 8. Setup & Running Locally

### Prerequisites
- Python 3.11+ and Node.js 20+
- Free API keys: **Groq** ([console.groq.com](https://console.groq.com)), **Gemini** ([aistudio.google.com](https://aistudio.google.com/app/apikey)) and, recommended, **Geoapify** ([myprojects.geoapify.com](https://myprojects.geoapify.com))

### 1. Configure keys
```bash
cp backend/.env.example backend/.env
# then fill in GROQ_API_KEY, GEMINI_API_KEY, GEOAPIFY_API_KEY
```

### 2. Start the backend
```bash
cd backend
python -m venv venv
# Windows:      .\venv\Scripts\Activate.ps1
# macOS/Linux:  source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API: `http://localhost:8000`. Docs: `http://localhost:8000/docs`

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
App: `http://localhost:5173`. The Vite dev server forwards `/api` requests to the backend.

### 4. Check it works
- `http://localhost:8000/api/health` should show `"groq_api_configured": true`.
- Click a new place on the map. Claims should be specific to that place, not generic template text.
- To clear stale results, delete the files in `backend/data/cache/`.

### Alternative: run everything with Docker
Requires Docker Desktop running. Steps 2–3 aren't needed; Docker reads the same `backend/.env` from step 1.

```bash
# from the project root
docker compose up --build -d
```

| Service | URL |
| :--- | :--- |
| App (Nginx) | `http://localhost:5173` |
| Backend API | `http://localhost:8000` (docs at `/docs`) |

- The app calls `/api/...` on its own address, and Nginx forwards those calls to the backend container.
- Cached results are written to `backend/data/cache/` on your machine, so they survive container rebuilds.
- After changing `backend/.env`, restart to apply it: `docker compose up -d --force-recreate backend`
- Logs: `docker compose logs -f backend`. Stop: `docker compose down`.
- Ports 8000 and 5173 must be free, so stop any local `uvicorn` / `npm run dev` first.

---

## 9. Configuration Reference

All backend settings live in `backend/.env`. The local setup and Docker Compose both read this one file; the frontend needs no keys.

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | — | Primary AI provider |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Groq model |
| `OPENROUTER_API_KEY` | — | Optional second AI provider |
| `OPENROUTER_MODEL` | `openai/gpt-oss-120b` | OpenRouter model |
| `GEMINI_API_KEY` | — | Backup generation + embeddings |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini generation model |
| `EMBEDDING_MODEL` | `models/gemini-embedding-001` | Embedding model |
| `GEOAPIFY_API_KEY` | — | Nearby venues (recommended) |
| `GOOGLE_MAPS_API_KEY` | — | Optional: ratings, price, open-now, better geocoding |
| `FOURSQUARE_API_KEY` | — | Optional: inspect endpoint only |
| `CACHE_TTL_HOURS` | `168` | Cache lifetime (7 days) |

---

## 10. Known Limitations

- **Place names can be too specific.** Reverse geocoding sometimes returns the nearest point of interest (e.g. "Tourism information Centre") instead of the town. The AI then has less cultural context, and a category can come back with few or no claims. Searching for the town by name avoids this.
- **OpenStreetMap Overpass is often slow.** When all three mirrors time out, the request waits about 12 s longer and has less heritage data. Overpass is then skipped for 10 minutes.
- **Embeddings depend on Gemini.** Groq has no embedding models. When Gemini's quota is used up, retrieval falls back to simpler hash vectors, which rank passages less accurately. The AI text itself is unaffected.
- **Gemini's free quota is small** (20 generation requests/day per model), so it only works as a short-term backup.
- **The cache is local to one machine** (JSON files), so it won't be shared across multiple servers.
- **Ratings only with Google.** Without a Google key, venue lists show distance and category but no star ratings.
- **Wikipedia sources are English only** for now.
- `CACHE_PRECISION_DECIMALS` in `.env` is not currently used; cache cells are fixed at 2 decimals.

---

## 11. Roadmap

- **Photo-to-place:** upload a photo of a monument to identify it and pull its history and lore.
- **Audio walking tours:** narrated, turn-by-turn routes between nearby highlights.
- **Time-travel mode:** explore what a place was like in different historical eras.
- **Multilingual guides:** local-language Wikipedia sources and translated output.
- **Personalisation:** filter by interests (food, architecture, spirituality) and dietary needs.

---

## 12. Summary

- **What it is:** a real-time AI tourism guide. Click anywhere on Earth and get its cultural significance, top sights and food culture, plus live lists of real nearby restaurants and attractions.
- **Why it's different:** answers are grounded in live sources (Wikipedia, Wikidata, OpenStreetMap, Geoapify/Google), cite those sources, and label every claim as **Verified**, **Documented** or **Local lore**, so travellers can tell fact from folklore.
- **How it's built:** React + Leaflet frontend and an async FastAPI backend running a RAG pipeline (fetch → chunk → embed with Gemini → retrieve → generate). Groq `gpt-oss-120b` is the main model (about 4 s per place), with OpenRouter, Gemini and built-in text as automatic fallbacks.
- **How to run it, and its costs:** start it with one command (`docker compose up --build`) or as two local dev servers. It runs entirely on free-tier APIs, and a ~1 km geo-cache plus rate limiting keep repeat costs near zero. Next steps are better place naming for small towns, a shared cache, tests and cloud deployment.
