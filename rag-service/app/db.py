"""Database helpers for the RAG service (Neon Postgres + pgvector)."""
import os
from contextlib import contextmanager

import psycopg
from pgvector import Vector
from pgvector.psycopg import register_vector

DATABASE_URL = os.getenv("DATABASE_URL", "")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))


@contextmanager
def get_conn():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    conn = psycopg.connect(DATABASE_URL)
    try:
        register_vector(conn)
        yield conn
    finally:
        conn.close()


def ensure_schema() -> None:
    """Create the pgvector extension and embeddings table if missing."""
    if not DATABASE_URL:
        return
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS rag_embeddings (
                id          BIGSERIAL PRIMARY KEY,
                document_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL DEFAULT 0,
                content     TEXT NOT NULL,
                embedding   VECTOR({EMBEDDING_DIM}) NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            """
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS rag_embeddings_document_id_idx "
            "ON rag_embeddings (document_id);"
        )
        try:
            cur.execute(
                "CREATE INDEX IF NOT EXISTS rag_embeddings_embedding_idx "
                "ON rag_embeddings USING hnsw (embedding vector_cosine_ops);"
            )
        except Exception:  # noqa: BLE001 - index is optional
            conn.rollback()
        conn.commit()


def to_vector(values: list[float]) -> Vector:
    """Adapt Python floats for pgvector operators (<=> etc.)."""
    return Vector(values)
