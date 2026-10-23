import sys
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routers import place_router

# Rate limiter to protect free tier quotas as outlined in system architecture
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(">> EXPLORIA Backend Initialized. Ready for RAG discoveries.")
    yield
    print(">> EXPLORIA Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="An AI Cultural & Culinary Discovery Engine for the Physical World — RAG-grounded with Epistemic Confidence Layer",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration for local dev & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    process_time = (time.time() - start) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Include Place / RAG Discovery router
app.include_router(place_router, prefix=settings.API_PREFIX, tags=["Discovery & RAG"])

@app.get("/")
async def root():
    return {
        "engine": "EXPLORIA Cultural & Culinary Discovery Engine",
        "status": "operational",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_endpoints": {
            "discover_place": "POST /api/place",
            "search_places": "GET /api/search?q={query}",
            "metrics": "GET /api/metrics",
            "rag_inspect": "GET /api/rag-inspect?lat={lat}&lng={lng}",
            "health": "GET /api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
