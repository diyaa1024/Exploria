import math
import re
from typing import Optional
import numpy as np
from app.config import settings
from app.models.schemas import RAGChunk

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

EMBEDDING_CACHE_SIZE = 5000

class RAGEngine:
    def __init__(self):
        self._genai_configured = False
        # (task_type, text) -> vector; chunks are re-embedded for each of the 3 categories otherwise
        self._embedding_cache: dict[tuple[str, str], list[float]] = {}

    def _configure_genai(self):
        if GENAI_AVAILABLE and settings.GEMINI_API_KEY and not self._genai_configured:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._genai_configured = True
            except Exception as e:
                print(f"GenAI configure error: {e}")

    def chunk_documents(self, documents: list[dict], max_chunk_chars: int = 500, overlap_chars: int = 70) -> list[RAGChunk]:
        """
        Splits fetched documents into clean, semantic passages.
        """
        chunks: list[RAGChunk] = []

        for doc in documents:
            text = doc.get("content", "").strip()
            source = doc.get("source", "Unknown")
            title = doc.get("title", "")
            url = doc.get("url")
            cat_relevance = doc.get("category_relevance")

            if not text:
                continue

            # Split text by paragraphs or sentences
            paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
            for p in paragraphs:
                if len(p) <= max_chunk_chars:
                    chunks.append(RAGChunk(
                        source=source,
                        title=title,
                        url=url,
                        content=p,
                        category_relevance=cat_relevance
                    ))
                else:
                    # Slide window with overlap
                    start = 0
                    while start < len(p):
                        end = min(start + max_chunk_chars, len(p))
                        # Try to snap to sentence end
                        if end < len(p):
                            last_punct = max(p.rfind(". ", start, end), p.rfind("! ", start, end), p.rfind("? ", start, end))
                            if last_punct > start + 100:
                                end = last_punct + 1
                        sub_text = p[start:end].strip()
                        if len(sub_text) > 40:
                            chunks.append(RAGChunk(
                                source=source,
                                title=title,
                                url=url,
                                content=sub_text,
                                category_relevance=cat_relevance
                            ))
                        start += (max_chunk_chars - overlap_chars)

        return chunks

    def _fallback_pseudo_embedding(self, text: str, dim: int = 128) -> list[float]:
        """
        Deterministic hash-based dense vector for when Gemini key is not yet configured.
        Enables seamless local testing and full offline functionality.
        """
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        for i, word in enumerate(words):
            h = hash(word) % dim
            vec[h] += 1.0 / (1.0 + 0.1 * i)
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]

    async def get_embedding(self, text: str) -> list[float]:
        """
        Generates text embedding using Gemini.
        Falls back to local dense vector if Gemini is unavailable.
        """
        return (await self.get_embeddings([text]))[0]

    async def get_embeddings(self, texts: list[str], task_type: str = "retrieval_query") -> list[list[float]]:
        """
        Embeds many texts in a single batched Gemini call, reusing cached vectors.
        If Gemini fails, every text gets the local fallback so all vectors share one dimension.
        """
        self._configure_genai()

        if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
            keys = [(task_type, t[:2000]) for t in texts]
            missing = list(dict.fromkeys(k for k in keys if k not in self._embedding_cache))
            try:
                if missing:
                    result = await genai.embed_content_async(
                        model=settings.EMBEDDING_MODEL,
                        content=[text for _, text in missing],
                        task_type=task_type,
                        request_options={"timeout": 15, "retry": None},
                    )
                    for key, vec in zip(missing, result["embedding"]):
                        self._embedding_cache[key] = vec
                    if len(self._embedding_cache) > EMBEDDING_CACHE_SIZE:
                        self._embedding_cache.clear()
                return [self._embedding_cache[k] for k in keys]
            except Exception as e:
                print(f"Gemini embedding API call error: {e}")

        return [self._fallback_pseudo_embedding(t) for t in texts]

    async def retrieve_top_k_chunks(
        self,
        chunks: list[RAGChunk],
        query: str,
        k: int = 3,
        category: Optional[str] = None
    ) -> list[RAGChunk]:
        """
        Performs semantic vector retrieval against the in-memory/Chroma chunk collection.
        Returns top-k chunks with cosine similarity ranking.
        """
        if not chunks:
            return []

        # If very few chunks, return all relevant
        if len(chunks) <= k:
            for c in chunks:
                c.similarity_score = 0.95
            return chunks

        # Query and chunks in one batch, so both always come from the same embedding model
        vectors = await self.get_embeddings([query] + [c.content for c in chunks])
        query_vec = np.array(vectors[0], dtype=np.float32)
        q_norm = np.linalg.norm(query_vec) or 1.0
        query_vec = query_vec / q_norm

        scored_chunks: list[tuple[float, RAGChunk]] = []

        for chunk, vec in zip(chunks, vectors[1:]):
            c_vec = np.array(vec, dtype=np.float32)
            c_norm = np.linalg.norm(c_vec) or 1.0
            c_vec = c_vec / c_norm

            sim = float(np.dot(query_vec, c_vec))

            # Bonus for explicit category tag match
            if category and chunk.category_relevance and category in chunk.category_relevance:
                sim += 0.08

            chunk_copy = chunk.model_copy()
            chunk_copy.similarity_score = round(max(0.1, min(0.99, sim)), 3)
            scored_chunks.append((sim, chunk_copy))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored_chunks[:k]]

rag_engine = RAGEngine()
