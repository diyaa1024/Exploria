import asyncio
import time
import httpx
from typing import Optional
from app.config import settings

HEADERS = {
    "User-Agent": "Exploria-RAG-Engine/1.0 (https://github.com/exploria-engine; contact@exploria.local)"
}

# Public Overpass instances are frequently overloaded (504s); try mirrors in order
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# When every mirror fails (e.g. Overpass blocked on this network), skip Overpass for a while
# instead of making every request wait out the timeouts again
OVERPASS_COOLDOWN_S = 600
_overpass_down_until = 0.0


async def post_overpass(query: str, timeout: float = 12.0) -> dict:
    """POSTs an Overpass QL query to all mirrors at once and returns the first JSON response."""
    global _overpass_down_until
    if time.monotonic() < _overpass_down_until:
        raise RuntimeError("Overpass skipped: all mirrors failed recently")

    async with httpx.AsyncClient(timeout=timeout, headers=HEADERS) as client:
        async def query_mirror(url: str) -> dict:
            resp = await client.post(url, data={"data": query})
            resp.raise_for_status()
            return resp.json()

        tasks = {asyncio.create_task(query_mirror(url)): url for url in OVERPASS_ENDPOINTS}
        last_error: Exception = RuntimeError("no Overpass endpoints configured")
        try:
            for done in asyncio.as_completed(tasks):
                try:
                    return await done
                except Exception as e:
                    last_error = e
        finally:
            for task in tasks:
                task.cancel()

    print(f"All Overpass mirrors failed ({last_error!r}); skipping Overpass for {OVERPASS_COOLDOWN_S // 60} min")
    _overpass_down_until = time.monotonic() + OVERPASS_COOLDOWN_S
    raise last_error

class DataFetcherService:
    @staticmethod
    async def fetch_wikipedia(query: str, lat: float, lng: float, wiki_title: Optional[str] = None) -> list[dict]:
        """
        Fetches Wikipedia summaries and extracts for the target location.
        Returns a list of raw document chunks with metadata.
        """
        chunks = []
        titles_to_fetch = []

        if wiki_title:
            titles_to_fetch.append(wiki_title)
        if query and query not in titles_to_fetch:
            titles_to_fetch.append(query)

        async with httpx.AsyncClient(timeout=8.0, headers=HEADERS) as client:
            # 1. Fetch geo-search articles nearby
            try:
                geo_url = f"https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lng}&gsradius=10000&gslimit=4&format=json"
                geo_resp = await client.get(geo_url)
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    for item in geo_data.get("query", {}).get("geosearch", []):
                        title = item.get("title")
                        if title and title not in titles_to_fetch:
                            titles_to_fetch.append(title)
            except Exception as e:
                print(f"Wikipedia geosearch error: {e}")

            # 2. Fetch page summaries for collected titles (up to 4)
            for title in titles_to_fetch[:4]:
                try:
                    safe_title = title.replace(" ", "_")
                    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{safe_title}"
                    resp = await client.get(summary_url)
                    if resp.status_code == 200:
                        data = resp.json()
                        extract = data.get("extract", "")
                        desc = data.get("description", "")
                        page_url = data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{safe_title}")
                        
                        full_text = f"{desc}. {extract}".strip() if desc else extract
                        if full_text and len(full_text) > 30:
                            chunks.append({
                                "source": "Wikipedia",
                                "title": title,
                                "url": page_url,
                                "content": full_text,
                                "category_relevance": "cultural_and_tourist"
                            })
                except Exception as e:
                    print(f"Wikipedia summary fetch error for {title}: {e}")

        return chunks

    @staticmethod
    async def fetch_osm_pois_and_culture(lat: float, lng: float, radius_meters: int = 3000) -> list[dict]:
        """
        Fetches tourist POIs, historical landmarks, and cultural spots using OpenStreetMap Overpass API.
        Completely free, no API key required, real physical world database.
        """
        chunks = []
        # Overpass QL query around coordinates for historic, tourism, and heritage nodes/ways
        query = f"""
        [out:json][timeout:10];
        (
          node["historic"](around:{radius_meters},{lat},{lng});
          way["historic"](around:{radius_meters},{lat},{lng});
          node["tourism"](around:{radius_meters},{lat},{lng});
          way["tourism"](around:{radius_meters},{lat},{lng});
          node["heritage"](around:{radius_meters},{lat},{lng});
          node["religion"](around:{radius_meters},{lat},{lng});
        );
        out tags 20;
        """
        try:
            data = await post_overpass(query)
            elements = data.get("elements", [])
            poi_lines = []
            for el in elements:
                tags = el.get("tags", {})
                name = tags.get("name:en") or tags.get("name")
                if not name:
                    continue
                historic_type = tags.get("historic") or tags.get("tourism") or tags.get("heritage") or tags.get("religion")
                start_date = tags.get("start_date") or tags.get("year_of_construction") or ""
                desc = tags.get("description") or tags.get("wikipedia") or ""

                line = f"- {name} (Type: {historic_type}"
                if start_date:
                    line += f", Date/Era: {start_date}"
                if desc:
                    line += f", Note: {desc}"
                line += ")"
                poi_lines.append(line)

            if poi_lines:
                # Combine into structured context
                summary_content = "Documented Local Heritage & Architectural Landmarks:\n" + "\n".join(poi_lines[:15])
                chunks.append({
                    "source": "OpenStreetMap / Heritage Registry",
                    "title": "Documented Local Landmarks & Historic Sites",
                    "url": f"https://www.openstreetmap.org/#map=15/{lat}/{lng}",
                    "content": summary_content,
                    "category_relevance": "tourist_and_cultural"
                })
        except Exception as e:
            print(f"OSM Overpass POI fetch error: {e!r}")

        return chunks

    @staticmethod
    async def fetch_food_and_culinary_spots(lat: float, lng: float, radius_meters: int = 2500) -> list[dict]:
        """
        Fetches authentic culinary hotspots, traditional restaurants, and cuisine specialties.
        Supports Foursquare if key provided; uses Overpass/OSM cuisine data as verified fallback.
        """
        chunks = []

        # 1. Try Foursquare Places if API key is provided
        if settings.FOURSQUARE_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    headers = {
                        "Accept": "application/json",
                        "Authorization": settings.FOURSQUARE_API_KEY
                    }
                    fs_url = f"https://api.foursquare.com/v3/places/search?ll={lat},{lng}&categories=13000&radius={radius_meters}&limit=10"
                    resp = await client.get(fs_url, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        places = data.get("results", [])
                        food_lines = []
                        for p in places:
                            p_name = p.get("name", "")
                            cats = [c.get("name", "") for c in p.get("categories", [])]
                            addr = p.get("location", {}).get("formatted_address", "")
                            food_lines.append(f"- {p_name} ({', '.join(cats)}): {addr}")

                        if food_lines:
                            chunks.append({
                                "source": "Foursquare Places",
                                "title": "Top-Rated Culinary & Local Dining Venues",
                                "url": "https://foursquare.com/explore",
                                "content": "Popular Local Gastronomy Venues:\n" + "\n".join(food_lines),
                                "category_relevance": "food_recommendations"
                            })
                            return chunks
            except Exception as e:
                print(f"Foursquare fetch fallback: {e}")

        # 2. OpenStreetMap Cuisine and Restaurant Registry
        query = f"""
        [out:json][timeout:10];
        (
          node["amenity"="restaurant"](around:{radius_meters},{lat},{lng});
          way["amenity"="restaurant"](around:{radius_meters},{lat},{lng});
          node["amenity"="cafe"](around:{radius_meters},{lat},{lng});
          node["amenity"="fast_food"](around:{radius_meters},{lat},{lng});
        );
        out tags 25;
        """
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
                url = "https://overpass-api.de/api/interpreter"
                resp = await client.post(url, data={"data": query})
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    spots = []
                    cuisines_seen = set()
                    for el in elements:
                        tags = el.get("tags", {})
                        name = tags.get("name:en") or tags.get("name")
                        cuisine = tags.get("cuisine")
                        if not name:
                            continue
                        entry = f"- {name}"
                        if cuisine:
                            entry += f" (Specialty/Cuisine: {cuisine})"
                            for c in cuisine.split(";"):
                                cuisines_seen.add(c.strip())
                        diet = tags.get("diet:vegetarian") or tags.get("diet:vegan")
                        if diet:
                            entry += " [Veg-friendly]"
                        spots.append(entry)

                    cuisine_summary = f"Identified regional cuisines: {', '.join(list(cuisines_seen)[:8])}." if cuisines_seen else ""
                    content_str = f"Documented Regional Food Venues & Local Eateries ({cuisine_summary}):\n" + "\n".join(spots[:15])

                    chunks.append({
                        "source": "OpenStreetMap Food & Cuisine Registry",
                        "title": "Local Eateries & Culinary Traditions",
                        "url": f"https://www.openstreetmap.org/#map=16/{lat}/{lng}",
                        "content": content_str,
                        "category_relevance": "food_recommendations"
                    })
        except Exception as e:
            print(f"OSM Food fetch error: {e}")

        return chunks

data_fetcher_service = DataFetcherService()
