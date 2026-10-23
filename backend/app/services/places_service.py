import asyncio
import math
from typing import Optional
from urllib.parse import quote_plus
import httpx
from app.config import settings
from app.models.schemas import NearbyPlace
from app.services.data_fetcher import post_overpass

GOOGLE_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
GOOGLE_FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.primaryTypeDisplayName",
    "places.shortFormattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.currentOpeningHours.openNow",
    "places.googleMapsUri",
])

# Google Places (New) "Table A" types
GOOGLE_TYPES = {
    "food": ["restaurant"],
    "tourist": ["tourist_attraction", "museum", "historical_landmark", "art_gallery"],
}

GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places"
GEOAPIFY_CATEGORIES = {
    "food": "catering.restaurant,catering.cafe,catering.fast_food,catering.food_court,catering.ice_cream",
    "tourist": "tourism.attraction,tourism.sights,entertainment.museum,entertainment.culture,heritage",
}

KINDS = ("food", "tourist")
SEARCH_RADIUS_M = {"food": 2500, "tourist": 5000}
MAX_RESULTS = 10

PRICE_LEVELS = {
    "PRICE_LEVEL_FREE": 0,
    "PRICE_LEVEL_INEXPENSIVE": 1,
    "PRICE_LEVEL_MODERATE": 2,
    "PRICE_LEVEL_EXPENSIVE": 3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
}


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def fame_score(rating: Optional[float], count: Optional[int]) -> float:
    """Rating weighted by review volume, so a 4.6 with 3,000 reviews outranks a 5.0 with 4."""
    if not rating:
        return 0.0
    return rating * math.log10((count or 0) + 10)


def osm_notability(tags: dict) -> float:
    """No ratings in OSM: approximate notability by how well-documented the place is."""
    return (
        (3 if tags.get("wikipedia") or tags.get("wikidata") else 0)
        + (1 if tags.get("website") or tags.get("contact:website") else 0)
        + (0.5 if tags.get("opening_hours") else 0)
        + (0.5 if tags.get("cuisine") else 0)
        + (1 if tags.get("heritage") else 0)
    )


class PlacesService:
    async def fetch_nearby(self, lat: float, lng: float) -> tuple[dict[str, list[NearbyPlace]], str]:
        """
        Returns ({"food": [...], "tourist": [...]}, provider_name).
        Provider chain: Google Places (ratings + review counts) when a key is configured,
        then Geoapify (real venues and distances, no ratings), then OpenStreetMap Overpass.
        Each section is filled independently, so a provider that only returns food
        still lets the next one fill in tourist spots.
        """
        providers = []
        if settings.GOOGLE_MAPS_API_KEY:
            providers.append(("Google Places", self._google_kinds))
        if settings.GEOAPIFY_API_KEY:
            providers.append(("Geoapify", self._geoapify_kinds))
        providers.append(("OpenStreetMap", lambda la, ln, _kinds: self._osm_nearby(la, ln)))

        result: dict[str, list[NearbyPlace]] = {k: [] for k in KINDS}
        used = []
        for name, fetch in providers:
            missing = [k for k in KINDS if not result[k]]
            if not missing:
                break
            try:
                fetched = await fetch(lat, lng, missing)
            except Exception as e:
                print(f"{name} nearby fetch error: {e}")
                continue
            filled = [k for k in missing if fetched.get(k)]
            for k in filled:
                result[k] = fetched[k]
            if filled:
                used.append(name)

        return result, " + ".join(used) or "none"

    async def _google_kinds(self, lat: float, lng: float, kinds: list[str]) -> dict[str, list[NearbyPlace]]:
        return await self._gather_kinds(self._google_nearby, lat, lng, kinds, "Google Places")

    async def _geoapify_kinds(self, lat: float, lng: float, kinds: list[str]) -> dict[str, list[NearbyPlace]]:
        return await self._gather_kinds(self._geoapify_nearby, lat, lng, kinds, "Geoapify")

    @staticmethod
    async def _gather_kinds(fetch, lat: float, lng: float, kinds: list[str], label: str) -> dict[str, list[NearbyPlace]]:
        results = await asyncio.gather(*(fetch(lat, lng, k) for k in kinds), return_exceptions=True)
        out = {}
        for kind, res in zip(kinds, results):
            if isinstance(res, Exception):
                print(f"{label} {kind} nearby error: {res}")
            else:
                out[kind] = res
        return out

    async def _google_nearby(self, lat: float, lng: float, kind: str) -> list[NearbyPlace]:
        body = {
            "includedTypes": GOOGLE_TYPES[kind],
            "maxResultCount": 20,
            "rankPreference": "POPULARITY",
            "languageCode": "en",
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": float(SEARCH_RADIUS_M[kind]),
                }
            },
        }
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": settings.GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(GOOGLE_NEARBY_URL, json=body, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"Places API {resp.status_code}: {resp.text[:300]}")
            data = resp.json()

        places = []
        for p in data.get("places", []):
            loc = p.get("location", {})
            p_lat, p_lng = loc.get("latitude"), loc.get("longitude")
            if p_lat is None or p_lng is None:
                continue
            places.append(NearbyPlace(
                id=p.get("id", ""),
                name=p.get("displayName", {}).get("text", "Unnamed"),
                category=p.get("primaryTypeDisplayName", {}).get("text"),
                address=p.get("shortFormattedAddress"),
                latitude=p_lat,
                longitude=p_lng,
                distance_m=round(haversine_m(lat, lng, p_lat, p_lng)),
                rating=p.get("rating"),
                rating_count=p.get("userRatingCount"),
                price_level=PRICE_LEVELS.get(p.get("priceLevel", "")),
                open_now=p.get("currentOpeningHours", {}).get("openNow"),
                maps_url=p.get("googleMapsUri"),
                source="Google Places",
            ))

        places.sort(key=lambda x: fame_score(x.rating, x.rating_count), reverse=True)
        return places[:MAX_RESULTS]

    async def _geoapify_nearby(self, lat: float, lng: float, kind: str) -> list[NearbyPlace]:
        params = {
            "categories": GEOAPIFY_CATEGORIES[kind],
            "filter": f"circle:{lng},{lat},{SEARCH_RADIUS_M[kind]}",
            "bias": f"proximity:{lng},{lat}",
            "limit": 100,
            "lang": "en",
            "apiKey": settings.GEOAPIFY_API_KEY,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(GEOAPIFY_PLACES_URL, params=params)
            if resp.status_code != 200:
                raise RuntimeError(f"Geoapify {resp.status_code}: {resp.text[:300]}")
            data = resp.json()

        scored: list[tuple[float, NearbyPlace]] = []
        seen = set()
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            raw = props.get("datasource", {}).get("raw", {})
            name = raw.get("name:en") or props.get("name")
            p_lat, p_lng = props.get("lat"), props.get("lon")
            if not name or p_lat is None or p_lng is None or name in seen:
                continue
            seen.add(name)

            if kind == "food":
                amenity = raw.get("amenity") or (props.get("categories") or ["catering.restaurant"])[-1].split(".")[-1]
                cuisine = raw.get("cuisine", "").replace(";", ", ").replace("_", " ")
                category = amenity.replace("_", " ").title() + (f" · {cuisine}" if cuisine else "")
            else:
                specific = max(props.get("categories") or ["tourism.attraction"], key=lambda c: c.count("."))
                category = (raw.get("tourism") or raw.get("historic") or specific.split(".")[-1]).replace("_", " ").title()

            address = props.get("address_line2")
            distance = props.get("distance")
            if distance is None:
                distance = haversine_m(lat, lng, p_lat, p_lng)
            distance = round(distance)

            place = NearbyPlace(
                id=f"geoapify-{props.get('place_id', name)}",
                name=name,
                category=category,
                address=address,
                latitude=p_lat,
                longitude=p_lng,
                distance_m=distance,
                # Geoapify has no ratings; a Google Maps search shows them one click away
                maps_url="https://www.google.com/maps/search/?api=1&query="
                + quote_plus(", ".join(filter(None, [name, address]))),
                source="Geoapify",
            )
            notability = osm_notability({**raw, "website": raw.get("website") or props.get("website")})
            scored.append((notability - distance / 5000, place))

        return [p for _, p in sorted(scored, key=lambda t: t[0], reverse=True)[:MAX_RESULTS]]

    async def _osm_nearby(self, lat: float, lng: float) -> dict[str, list[NearbyPlace]]:
        rf, rt = SEARCH_RADIUS_M["food"], SEARCH_RADIUS_M["tourist"]
        # Dense cities have thousands of venues, so famous (Wikipedia/Wikidata-linked) places
        # get their own output quota instead of competing with the general sample.
        query = f"""
        [out:json][timeout:15];
        nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"]["name"](around:{rf},{lat},{lng})->.f;
        (
          nwr["tourism"~"^(attraction|museum|gallery|viewpoint|theme_park|zoo|aquarium)$"]["name"](around:{rt},{lat},{lng});
          nwr["historic"~"^(monument|castle|archaeological_site|ruins|fort|palace|temple|church|city_gate)$"]["name"](around:{rt},{lat},{lng});
        )->.t;
        nwr.f[~"^(wikidata|wikipedia)$"~"."]; out center tags 60;
        .f out center tags 150;
        nwr.t[~"^(wikidata|wikipedia)$"~"."]; out center tags 80;
        .t out center tags 100;
        """
        elements = (await post_overpass(query, timeout=18.0)).get("elements", [])

        food: list[tuple[float, NearbyPlace]] = []
        tourist: list[tuple[float, NearbyPlace]] = []
        seen = set()
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name:en") or tags.get("name")
            p_lat = el.get("lat") or el.get("center", {}).get("lat")
            p_lng = el.get("lon") or el.get("center", {}).get("lon")
            # Same element can appear in both the "famous" and general outputs
            key = (el.get("type"), el.get("id"))
            if not name or p_lat is None or p_lng is None or key in seen or name in seen:
                continue
            seen.update({key, name})

            is_food = tags.get("amenity") in {"restaurant", "cafe", "fast_food", "food_court", "ice_cream"}
            if is_food:
                cuisine = tags.get("cuisine", "").replace(";", ", ").replace("_", " ")
                category = f"{tags['amenity'].replace('_', ' ').title()}" + (f" · {cuisine}" if cuisine else "")
            else:
                category = (tags.get("tourism") or tags.get("historic") or "attraction").replace("_", " ").title()

            distance = round(haversine_m(lat, lng, p_lat, p_lng))
            notability = osm_notability(tags)
            place = NearbyPlace(
                id=f"osm-{el.get('type')}-{el.get('id')}",
                name=name,
                category=category,
                address=" ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street")])) or None,
                latitude=p_lat,
                longitude=p_lng,
                distance_m=distance,
                maps_url=f"https://www.openstreetmap.org/{el.get('type')}/{el.get('id')}",
                source="OpenStreetMap",
            )
            # Rank by notability first, then proximity
            score = notability - distance / 5000
            (food if is_food else tourist).append((score, place))

        def top(items):
            return [p for _, p in sorted(items, key=lambda t: t[0], reverse=True)[:MAX_RESULTS]]

        return {"food": top(food), "tourist": top(tourist)}

    @staticmethod
    def to_rag_document(kind: str, places: list[NearbyPlace], lat: float, lng: float, provider: str) -> Optional[dict]:
        """Turns the live venue list into a RAG doc so Gemini grounds its claims in real places."""
        if not places:
            return None
        lines = []
        for p in places:
            line = f"- {p.name}"
            if p.category:
                line += f" ({p.category})"
            if p.rating:
                line += f", rated {p.rating}/5 from {p.rating_count or 0} reviews"
            line += f", {p.distance_m} m away"
            lines.append(line)
        is_food = kind == "food"
        return {
            "source": f"{provider} (live)",
            "title": "Top-Rated Food & Culinary Dining Spots Nearby" if is_food else "Popular Tourist Landmarks & Attractions Nearby",
            "url": f"https://www.openstreetmap.org/#map=15/{lat}/{lng}",
            "content": ("Famous restaurants and local eateries nearby:\n" if is_food else "Famous tourist attractions and landmarks nearby:\n") + "\n".join(lines),
            "category_relevance": "food_recommendations" if is_food else "tourist_highlights",
        }


places_service = PlacesService()
