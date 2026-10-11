from __future__ import annotations
import json
from sqlalchemy.orm import Session

from app.core.config import settings
from app.rag.indexer import get_collection
from app.models.chatbot_log import ChatbotLog


# İlaç sorusu için — sadece veritabanı bağlamıyla yanıt ver
RAG_SYSTEM_PROMPT = """Sen VetCore sisteminin veteriner ilaç bilgi asistanısın.
Sana verilen veritabanı bağlamını kullanarak soruyu yanıtla.

KESINLIKLE YAPMA:
- Hayvan için kesin tanı koyma
- Tedavi planı veya ilaç reçetesi önerme
- Spesifik doz tavsiyesi verme ("X mg/kg ver" gibi)
- Bağlamda olmayan bilgi uydurma

YAPMAN GEREKENLER:
- Soruyu veritabanındaki ilaç bilgileriyle yanıtla
- Kullandığın ilaç kaynaklarını yanıt sonunda listele
- Her yanıtın sonuna kısa güvenlik notu ekle

Yanıt dilini kullanıcının dili ile eşleştir (Türkçe soru → Türkçe yanıt)."""

# Genel soru için — Gemini'nin kendi bilgisiyle yanıt ver
GENERAL_SYSTEM_PROMPT = """Sen VetCore sisteminin veteriner bilgi asistanısın.
Veterinerlik, hayvan sağlığı ve ilaçlar hakkında genel sorulara kendi bilginle yanıt ver.

KESINLIKLE YAPMA:
- Hayvan için kesin tanı koyma
- Tedavi planı veya ilaç reçetesi önerme
- Spesifik doz tavsiyesi verme

Her yanıtın sonuna kısa güvenlik notu ekle.
Yanıt dilini kullanıcının dili ile eşleştir (Türkçe soru → Türkçe yanıt)."""

# ChromaDB benzerlik eşiği: bu değerin altı = ilgili ilaç verisi bulundu
# Türkçe sorgular vs İngilizce DB — dil uyuşmazlığı nedeniyle eşik çok düşük tutulmalı
RELEVANCE_THRESHOLD = 0.8


def retrieve(question: str, n_results: int = 5) -> list[dict]:
    """ChromaDB'den ilgili ilaç bilgilerini getirir."""
    try:
        collection = get_collection()
        results = collection.query(
            query_texts=[question],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )
        items = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            items.append({
                "document": doc,
                "drug_name": meta.get("drug_name", ""),
                "drug_id": meta.get("drug_id"),
                "spc_url": meta.get("spc_url", ""),
                "distance": dist,
            })
        return items
    except Exception:
        return []


def ask(question: str, user_id: int | None, db: Session) -> dict:
    """Hibrit pipeline: ilaç sorusu → RAG, genel soru → Gemini."""

    api_key = settings.GEMINI_API_KEY

    # 1. ChromaDB'den en yakın sonuçları getir
    chunks = retrieve(question, n_results=5)

    # 2. Sonuçların ne kadar ilgili olduğuna bak
    is_drug_question = bool(chunks) and min(c["distance"] for c in chunks) < RELEVANCE_THRESHOLD

    if not api_key:
        answer = _demo_answer(question, chunks) if is_drug_question else "API key ayarlanmamış."
        sources = _build_sources(chunks) if is_drug_question else []
        _log(user_id, question, answer, sources, db)
        return {"answer": answer, "sources": sources, "found": is_drug_question}

    if is_drug_question:
        # 3a. İlaç sorusu → veritabanı bağlamıyla yanıtla
        context_parts, sources = [], []
        seen: set = set()
        for chunk in chunks:
            if chunk["distance"] < RELEVANCE_THRESHOLD and chunk["drug_name"] not in seen:
                seen.add(chunk["drug_name"])
                context_parts.append(chunk["document"])
                if chunk["drug_name"]:
                    sources.append({"name": chunk["drug_name"], "spc_url": chunk["spc_url"] or None})

        context = "\n\n---\n\n".join(context_parts)
        answer = _call_gemini_rag(question, context, api_key)
        _log(user_id, question, answer, sources, db)
        return {"answer": answer, "sources": sources, "found": True}

    else:
        # 3b. Genel soru → Gemini'nin kendi bilgisiyle yanıtla
        answer = _call_gemini_general(question, api_key)
        _log(user_id, question, answer, [], db)
        return {"answer": answer, "sources": [], "found": False}


def _call_gemini_rag(question: str, context: str, api_key: str) -> str:
    """Veritabanı bağlamıyla Gemini'ye sor."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    user_message = f"""Aşağıdaki ilaç veritabanı bilgisini kullanarak soruyu yanıtla.

VERITABANI BAĞLAMI:
{context}

SORU: {question}"""

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        config=types.GenerateContentConfig(
            system_instruction=RAG_SYSTEM_PROMPT,
            max_output_tokens=1024,
        ),
        contents=user_message,
    )
    return response.text


def _call_gemini_general(question: str, api_key: str) -> str:
    """Genel soru — Google Search ile internetten yanıtla."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    # Google Search grounding ile internet araması yap
    try:
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            config=types.GenerateContentConfig(
                system_instruction=GENERAL_SYSTEM_PROMPT,
                tools=[types.Tool(google_search=types.GoogleSearch())],
                max_output_tokens=1024,
            ),
            contents=question,
        )
        return response.text
    except Exception:
        # Google Search desteklenmiyorsa kendi bilgisiyle yanıtla
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            config=types.GenerateContentConfig(
                system_instruction=GENERAL_SYSTEM_PROMPT,
                max_output_tokens=1024,
            ),
            contents=question,
        )
        return response.text


def _build_sources(chunks: list[dict]) -> list[dict]:
    sources, seen = [], set()
    for chunk in chunks:
        if chunk["drug_name"] and chunk["drug_name"] not in seen:
            seen.add(chunk["drug_name"])
            sources.append({"name": chunk["drug_name"], "spc_url": chunk["spc_url"] or None})
    return sources


def _demo_answer(question: str, chunks: list[dict]) -> str:
    names = [c["drug_name"] for c in chunks[:3] if c["drug_name"]]
    return (
        f"**Demo Yanıt** (API key ayarlanmamış)\n\n"
        f"Sorunuzla ilgili veritabanında şu ilaçlar bulundu: {', '.join(names)}.\n\n"
        f"⚠️ Bu bilgiler yalnızca referans amaçlıdır."
    )


def _log(user_id: int | None, question: str, answer: str, sources: list, db: Session):
    log = ChatbotLog(
        user_id=user_id,
        question=question,
        answer=answer,
        sources=json.dumps(sources, ensure_ascii=False),
    )
    db.add(log)
    try:
        db.commit()
    except Exception:
        db.rollback()


def get_logs(db: Session, page: int = 1, size: int = 50) -> dict:
    q = db.query(ChatbotLog).order_by(ChatbotLog.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    result = []
    for log in items:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "question": log.question,
            "answer": log.answer[:200] + "..." if len(log.answer) > 200 else log.answer,
            "sources": json.loads(log.sources) if log.sources else [],
            "created_at": log.created_at,
        })
    return {"total": total, "page": page, "items": result}
