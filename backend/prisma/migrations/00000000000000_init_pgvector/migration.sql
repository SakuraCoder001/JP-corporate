-- Enable pgvector (pre-installed on Neon) and create the embeddings table.
-- This migration is run manually / alongside `prisma migrate` so the RAG
-- service and backend share the same vector store.
--
-- NOTE: Prisma manages the relational tables. This file only ensures the
-- vector extension and embeddings table exist. The embeddings table is NOT
-- modeled in Prisma because Prisma lacks a first-class vector column type.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_embeddings (
  id          BIGSERIAL PRIMARY KEY,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content     TEXT NOT NULL,
  embedding   VECTOR(384) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rag_embeddings_document_id_idx
  ON rag_embeddings (document_id);

-- HNSW index for fast cosine similarity search.
CREATE INDEX IF NOT EXISTS rag_embeddings_embedding_idx
  ON rag_embeddings USING hnsw (embedding vector_cosine_ops);
