# 🧭 Exploria

**A real-time AI tourism guide for anywhere on Earth.**

Click any point on a world map, or search for a place, and Exploria builds a live guide to it in seconds. It covers the place's cultural significance, its top sights and its food culture, and lists real restaurants and attractions nearby. Every claim is grounded in live public sources and labelled by how trustworthy it is.

> For the business view, full architecture, API and model details, and the implementation plan, see **[PROJECT_DETAILS.md](PROJECT_DETAILS.md)**.

---

## Overview

General-purpose AI chatbots often invent travel facts and present myths in the same tone as recorded history. Exploria avoids this by fetching real data first (Wikipedia, Wikidata, OpenStreetMap, live places APIs). It then uses AI only to summarise that evidence, and labels every statement:

| Tier | Meaning |
| :--- | :--- |
| 🟢 **Verified** | Hard facts: dates, measurements, UNESCO listings, official records |
| 🔵 **Documented** | Recorded in chronicles, travelogues or archives; details may vary |
| 🟣 **Local lore** | Oral tradition, myths, spiritual beliefs, folklore |

### Features
- **Interactive world map:** click anywhere to discover it. Three map styles: illustrated atlas, dark and satellite.
- **Place search** with autocomplete.
- **Three guide sections:** Cultural Significance, Tourist Highlights, and Food & Culinary.
- **Claim cards** with an evidence-tier badge, the reason for the rating, tags and source links.
- **Live nearby lists:** real restaurants and attractions with distance, category and map links. Ratings are added when a Google key is set.
- **Fast repeat visits:** results are cached per ~1 km area for 7 days.
- **Developer views:** a RAG evidence inspector and an in-app system design overview.
- Responsive desktop and mobile layout.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Leaflet |
| Backend | Python 3.11, FastAPI, Uvicorn, httpx, Pydantic |
| AI text generation | Groq `openai/gpt-oss-120b` → OpenRouter (optional) → Google Gemini → built-in fallback |
| Embeddings | Google `gemini-embedding-001` (local fallback vectors if unavailable) |
| Data sources | Wikipedia, Wikidata, OpenStreetMap (Nominatim, Overpass), Geoapify, Google Places (optional) |
| Caching | Geo-clustered JSON disk cache + in-memory embedding cache |
| Deployment | Docker, Docker Compose, Nginx |

## How It Works

1. **Locate:** turn the clicked coordinates into a place name, and find its Wikidata/Wikipedia entry.
2. **Gather:** fetch Wikipedia articles, OpenStreetMap heritage sites and live nearby venues, all in parallel.
3. **Retrieve:** split the text into passages, embed them, and pick the 3 most relevant for each guide section.
4. **Generate:** the AI writes 3–4 evidence-tiered claims per section in strict JSON. If one AI provider fails, the next is used automatically.
5. **Cache & serve:** save the result for the ~1 km area and send it to the map interface.

---

## Getting Started

### Prerequisites
- Python 3.11+ and Node.js 20+ (or just Docker Desktop)
- Free API keys:
  - **Groq** (main AI provider): https://console.groq.com
  - **Google Gemini** (embeddings + backup AI): https://aistudio.google.com/app/apikey
  - **Geoapify** (nearby places, recommended): https://myprojects.geoapify.com
  - *Optional:* Google Maps/Places (ratings), OpenRouter (extra AI backup)

### 1. Clone and configure
```bash
git clone https://github.com/diyaa1024/Exploria.git
cd Exploria
cp backend/.env.example backend/.env
```
Open `backend/.env` and fill in `GROQ_API_KEY`, `GEMINI_API_KEY` and `GEOAPIFY_API_KEY`.

### 2a. Run locally

**Backend** (terminal 1):
```bash
cd backend
python -m venv venv
# Windows:      .\venv\Scripts\Activate.ps1
# macOS/Linux:  source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The API runs at http://localhost:8000, with interactive docs at `/docs`.

### 2b. Or run with Docker
```bash
docker compose up --build -d
```
- App: **http://localhost:5173**. API: http://localhost:8000
- Docker reads the same `backend/.env`. After changing it, run `docker compose up -d --force-recreate backend`.
- Stop with `docker compose down`.

### 3. Check it works
- http://localhost:8000/api/health should show `"groq_api_configured": true`.
- Click a place on the map. You should see claims specific to that place and live nearby lists.

---

## Configuration

All settings live in `backend/.env` (see [`backend/.env.example`](backend/.env.example)).

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | Recommended | Main AI provider |
| `GEMINI_API_KEY` | Recommended | Embeddings + backup AI |
| `GEOAPIFY_API_KEY` | Recommended | Nearby restaurants & attractions |
| `OPENROUTER_API_KEY` | Optional | Extra AI backup |
| `GOOGLE_MAPS_API_KEY` | Optional | Ratings, prices, open-now, better geocoding |
| `GROQ_MODEL` / `GEMINI_MODEL` | Optional | Override the default models |
| `CACHE_TTL_HOURS` | Optional | Cache lifetime (default 168 = 7 days) |

The app still runs without any keys, using built-in text and OpenStreetMap data, but the results are much less specific.

## API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/place` | Build the guide for a coordinate (`latitude`, `longitude`, optional `place_name`, `force_refresh`) |
| `GET` | `/api/search?q=` | Place search suggestions |
| `GET` | `/api/metrics` | Cache hit ratio, latency, cost saved |
| `GET` | `/api/health` | Configured providers and active models |

## Project Structure

```
Exploria/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, rate limiting
│   │   ├── config.py          # Settings & API keys
│   │   ├── models/            # Pydantic schemas
│   │   ├── routers/place.py   # API endpoints & discovery pipeline
│   │   └── services/          # Geocoding, data fetching, places, RAG, AI generation, cache
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/                   # React app & components
│   ├── nginx.conf             # Production server + /api proxy
│   └── Dockerfile
├── docker-compose.yml
├── PROJECT_DETAILS.md         # Full business & technical write-up
└── SYSTEM_DESIGN.md
```

## Roadmap
- Photo-to-place recognition
- Audio walking tours
- Time-travel mode (a place across historical eras)
- Multilingual guides and personalised interests
