"""FastAPI RAG service.

Endpoints:
  POST   /ingest             -> chunk + embed a document, store in pgvector
  POST   /query              -> embed query, return top-k similar chunks
  DELETE /documents/{id}     -> remove a document's embeddings
  GET    /health             -> readiness check
"""
import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

from .db import ensure_schema, get_conn, to_vector  # noqa: E402
from .embeddings import chunk_text, embed_text, embed_texts  # noqa: E402

app = FastAPI(title="JP Corporate RAG Service", version="1.0.0")


class IngestRequest(BaseModel):
    document_id: str
    content: str


class IngestResponse(BaseModel):
    document_id: str
    chunks: int


class QueryRequest(BaseModel):
    query: str
    top_k: int = 4


class QueryResult(BaseModel):
    content: str
    document_id: str
    score: float


class QueryResponse(BaseModel):
    results: List[QueryResult]


@app.on_event("startup")
def startup() -> None:
    try:
        ensure_schema()
    except Exception as exc:  # noqa: BLE001
        print(f"[rag] schema init skipped: {exc}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")}


@app.post("/ingest", response_model=IngestResponse)
def ingest(req: IngestRequest) -> IngestResponse:
    chunks = chunk_text(req.content)
    if not chunks:
        return IngestResponse(document_id=req.document_id, chunks=0)

    vectors = embed_texts(chunks)
    try:
        with get_conn() as conn, conn.cursor() as cur:
            # Replace any existing embeddings for this document.
            cur.execute(
                "DELETE FROM rag_embeddings WHERE document_id = %s",
                (req.document_id,),
            )
            for idx, (chunk, vec) in enumerate(zip(chunks, vectors)):
                cur.execute(
                    "INSERT INTO rag_embeddings (document_id, chunk_index, content, embedding) "
                    "VALUES (%s, %s, %s, %s)",
                    (req.document_id, idx, chunk, to_vector(vec)),
                )
            conn.commit()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"ingest failed: {exc}") from exc

    return IngestResponse(document_id=req.document_id, chunks=len(chunks))


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest) -> QueryResponse:
    if not req.query.strip():
        return QueryResponse(results=[])

    vec = to_vector(embed_text(req.query))
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT content, document_id, 1 - (embedding <=> %s::vector) AS score "
                "FROM rag_embeddings "
                "ORDER BY embedding <=> %s::vector "
                "LIMIT %s",
                (vec, vec, req.top_k),
            )
            rows = cur.fetchall()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"query failed: {exc}") from exc

    results = [
        QueryResult(content=row[0], document_id=row[1], score=float(row[2]))
        for row in rows
    ]
    return QueryResponse(results=results)


@app.delete("/documents/{document_id}")
def delete_document(document_id: str) -> dict:
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM rag_embeddings WHERE document_id = %s",
                (document_id,),
            )
            conn.commit()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"delete failed: {exc}") from exc
    return {"ok": True}
