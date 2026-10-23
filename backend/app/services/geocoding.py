import httpx
from typing import Optional, Tuple
from app.config import settings
from app.models.schemas import SearchLocationSuggestion

HEADERS = {
    "User-Agent": "Exploria-DiscoveryEngine/1.0 (https://github.com/exploria-engine; contact@exploria.local)"
}

class GeocodingService:
    @staticmethod
    async def reverse_geocode(lat: float, lng: float) -> dict:
        """
        Reverse geocodes coordinates to obtain place name, formatted address, and country.
        Uses Google Geocoding API if key is present; gracefully falls back to OpenStreetMap Nominatim.
        """
        # 1. Try Google Geocoding API if API key provided
        if settings.GOOGLE_MAPS_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={settings.GOOGLE_MAPS_API_KEY}"
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("status") == "OK" and data.get("results"):
                            top_result = data["results"][0]
                            # Extract address components
                            country = ""
                            locality = ""
                            for comp in top_result.get("address_components", []):
                                types = comp.get("types", [])
                                if "country" in types:
                                    country = comp.get("long_name", "")
                                if "locality" in types or "postal_town" in types or "administrative_area_level_2" in types:
                                    if not locality:
                                        locality = comp.get("long_name", "")

                            place_name = locality or top_result.get("formatted_address", "").split(",")[0]
                            return {
                                "place_name": place_name,
                                "formatted_address": top_result.get("formatted_address", f"{lat}, {lng}"),
                                "country": country or "Global",
                                "source": "Google Geocoding API"
                            }
            except Exception as e:
                print(f"Google geocoding fallback triggered: {e}")

        # 2. OpenStreetMap Nominatim Fallback (100% free, no credit card required)
        try:
            async with httpx.AsyncClient(timeout=6.0, headers=HEADERS) as client:
                url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=jsonv2&addressdetails=1"
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    address = data.get("address", {})
                    name = (
                        data.get("name")
                        or address.get("city")
                        or address.get("town")
                        or address.get("village")
                        or address.get("municipality")
                        or address.get("county")
                        or address.get("state")
                        or "Unknown Location"
                    )
                    country = address.get("country", "")
                    formatted = data.get("display_name", f"{lat:.4f}, {lng:.4f}")
                    return {
                        "place_name": name,
                        "formatted_address": formatted,
                        "country": country or "Global",
                        "source": "OpenStreetMap Nominatim"
                    }
        except Exception as e:
            print(f"OSM Nominatim error: {e}")

        return {
            "place_name": f"Location ({lat:.3f}, {lng:.3f})",
            "formatted_address": f"Coordinates {lat:.4f}, {lng:.4f}",
            "country": "Unknown",
            "source": "Coordinate Fallback"
        }

    @staticmethod
    async def lookup_wikidata_entity(lat: float, lng: float, place_name: str) -> Optional[dict]:
        """
        Looks up nearby Wikidata entity and connected Wikipedia article for deep RAG facts.
        """
        try:
            async with httpx.AsyncClient(timeout=6.0, headers=HEADERS) as client:
                # Geo-search nearby entities within 15km
                url = f"https://www.wikidata.org/w/api.php?action=query&list=geosearch&gsradius=15000&gscoord={lat}|{lng}&gslimit=8&format=json"
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    pages = data.get("query", {}).get("geosearch", [])
                    if pages:
                        # Find best match or top entity
                        top_entity = pages[0]
                        qid = top_entity.get("title")
                        title = top_entity.get("title")

                        # Fetch entity claims and sitelinks
                        detail_url = f"https://www.wikidata.org/w/api.php?action=wbgetentities&ids={qid}&props=labels|descriptions|sitelinks&languages=en&format=json"
                        detail_resp = await client.get(detail_url)
                        if detail_resp.status_code == 200:
                            ent_data = detail_resp.json().get("entities", {}).get(qid, {})
                            label = ent_data.get("labels", {}).get("en", {}).get("value", top_entity.get("title"))
                            desc = ent_data.get("descriptions", {}).get("en", {}).get("value", "")
                            enwiki = ent_data.get("sitelinks", {}).get("enwiki", {}).get("title", "")
                            return {
                                "qid": qid,
                                "label": label,
                                "description": desc,
                                "wikipedia_title": enwiki or label,
                                "wikidata_url": f"https://www.wikidata.org/wiki/{qid}"
                            }
        except Exception as e:
            print(f"Wikidata lookup exception: {e}")
        return None

    @staticmethod
    async def search_places(query: str) -> list[SearchLocationSuggestion]:
        """
        Search for places by keyword with coordinates for direct map navigation.
        """
        results: list[SearchLocationSuggestion] = []
        try:
            async with httpx.AsyncClient(timeout=6.0, headers=HEADERS) as client:
                url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=6&addressdetails=1"
                resp = await client.get(url)
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items:
                        results.append(
                            SearchLocationSuggestion(
                                name=item.get("name") or item.get("display_name", "").split(",")[0],
                                display_name=item.get("display_name", ""),
                                latitude=float(item.get("lat")),
                                longitude=float(item.get("lon")),
                                type=item.get("type")
                            )
                        )
        except Exception as e:
            print(f"Search places error: {e}")
        return results

geocoding_service = GeocodingService()
