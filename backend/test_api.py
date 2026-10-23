import httpx

def test():
    print("Testing EXPLORIA API...")
    url = "http://127.0.0.1:8000/api/place"
    payload = {
        "latitude": 35.0116,
        "longitude": 135.7681,
        "place_name": "Kyoto, Japan"
    }
    r = httpx.post(url, json=payload, timeout=25.0)
    print("Status:", r.status_code)
    data = r.json()
    print("Place Name:", data.get("place_name"))
    print("Categories:", list(data.get("categories", {}).keys()))
    print("Epistemic Stats:", data.get("epistemic_stats"))
    print("Latency ms:", data.get("latency_ms"))
    print("Cached (First Call):", data.get("cached"))

    # Test cache hit on second query!
    print("\nTesting Cache Hit (Immediate retrieval)...")
    r2 = httpx.post(url, json=payload, timeout=5.0)
    data2 = r2.json()
    print("Second Query Cached?:", data2.get("cached"))
    print("Second Query Latency ms:", data2.get("latency_ms"))

if __name__ == "__main__":
    test()
