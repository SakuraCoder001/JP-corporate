"""Local embedding model wrapper (sentence-transformers, free / no API key)."""
import os
from functools import lru_cache
from typing import List

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def _get_model():
    # Imported lazily so the service can boot even while the model downloads.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(MODEL_NAME)


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
    return [v.tolist() for v in vectors]


def embed_text(text: str) -> List[float]:
    return embed_texts([text])[0]


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Naive character-based chunking with overlap."""
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
        if start < 0:
            start = 0
    return chunks
