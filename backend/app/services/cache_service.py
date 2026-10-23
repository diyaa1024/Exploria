import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Any
from app.config import settings

class CacheService:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or settings.CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.metrics_file = self.cache_dir / "_metrics.json"
        self._init_metrics()

    def _init_metrics(self):
        if not self.metrics_file.exists():
            initial_data = {
                "total_queries": 0,
                "cache_hits": 0,
                "cache_misses": 0,
                "total_latency_ms": 0.0,
                "total_rag_chunks_processed": 0,
                "estimated_cost_saved_usd": 0.0,
                "last_reset": datetime.now(timezone.utc).isoformat()
            }
            self._write_json(self.metrics_file, initial_data)

    def _get_cache_key(self, lat: float, lng: float) -> str:
        # Precision 3 decimals ~ 110m, precision 2 ~ 1.1km
        # For city/neighborhood discovery, 2 decimals (~1km) offers excellent cache efficiency
        lat_rounded = round(lat, 2)
        lng_rounded = round(lng, 2)
        return f"geo_{lat_rounded:.2f}_{lng_rounded:.2f}.json"

    def _read_json(self, path: Path) -> Optional[dict]:
        try:
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            pass
        return None

    def _write_json(self, path: Path, data: dict):
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error writing cache file {path}: {e}")

    def get(self, lat: float, lng: float) -> Optional[dict]:
        key = self._get_cache_key(lat, lng)
        cache_path = self.cache_dir / key
        data = self._read_json(cache_path)
        if not data:
            return None

        # Check TTL
        cached_time = data.get("_cached_at_epoch", 0)
        max_age = settings.CACHE_TTL_HOURS * 3600
        if time.time() - cached_time > max_age:
            try:
                cache_path.unlink(missing_ok=True)
            except Exception:
                pass
            return None

        return data.get("payload")

    def set(self, lat: float, lng: float, payload: dict):
        key = self._get_cache_key(lat, lng)
        cache_path = self.cache_dir / key
        cache_record = {
            "_cached_at_epoch": time.time(),
            "_cached_at_iso": datetime.now(timezone.utc).isoformat(),
            "lat": lat,
            "lng": lng,
            "payload": payload
        }
        self._write_json(cache_path, cache_record)

    def record_query(self, is_hit: bool, latency_ms: float, chunks_processed: int = 0):
        metrics = self._read_json(self.metrics_file) or {}
        metrics["total_queries"] = metrics.get("total_queries", 0) + 1
        if is_hit:
            metrics["cache_hits"] = metrics.get("cache_hits", 0) + 1
            # Standard Gemini 2.5 Flash / embedding call estimation saved: ~$0.005 per complete place RAG synthesis
            metrics["estimated_cost_saved_usd"] = round(metrics.get("estimated_cost_saved_usd", 0.0) + 0.005, 4)
        else:
            metrics["cache_misses"] = metrics.get("cache_misses", 0) + 1

        metrics["total_latency_ms"] = round(metrics.get("total_latency_ms", 0.0) + latency_ms, 2)
        metrics["total_rag_chunks_processed"] = metrics.get("total_rag_chunks_processed", 0) + chunks_processed
        self._write_json(self.metrics_file, metrics)

    def get_metrics(self) -> dict:
        metrics = self._read_json(self.metrics_file) or {
            "total_queries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_latency_ms": 0.0,
            "total_rag_chunks_processed": 0,
            "estimated_cost_saved_usd": 0.0,
            "last_reset": datetime.now(timezone.utc).isoformat()
        }
        total = metrics.get("total_queries", 0)
        hits = metrics.get("cache_hits", 0)
        misses = metrics.get("cache_misses", 0)
        total_lat = metrics.get("total_latency_ms", 0.0)

        hit_ratio = round((hits / total) * 100, 1) if total > 0 else 0.0
        avg_lat = round(total_lat / total, 1) if total > 0 else 0.0

        return {
            "total_queries": total,
            "cache_hits": hits,
            "cache_misses": misses,
            "cache_hit_ratio": hit_ratio,
            "avg_latency_ms": avg_lat,
            "total_rag_chunks_processed": metrics.get("total_rag_chunks_processed", 0),
            "estimated_cost_saved_usd": metrics.get("estimated_cost_saved_usd", 0.0),
            "last_reset": metrics.get("last_reset", datetime.now(timezone.utc).isoformat())
        }

cache_service = CacheService()
