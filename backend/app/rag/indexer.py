"""
İlaç veritabanını ChromaDB'ye index'ler.
Çalıştır: python -m app.rag.indexer
"""
from __future__ import annotations
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.drug import Drug
from app.core.config import settings

COLLECTION_NAME = "vet_drugs"


_collection = None


def get_collection(client=None):
    global _collection
    if _collection is not None:
        return _collection
    if client is None:
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
    ef = DefaultEmbeddingFunction()
    _collection = client.get_or_create_collection(name=COLLECTION_NAME, embedding_function=ef)
    return _collection


def drug_to_text(drug: Drug) -> str:
    """İlaç kaydını embedding için düz metne çevirir."""
    parts = [f"İlaç: {drug.name}"]
    if drug.trade_names:
        parts.append(f"Ticari isim: {drug.trade_names}")
    if drug.pharmacological_class:
        parts.append(f"Farmakolojik sınıf: {drug.pharmacological_class}")
    species = [s.name for s in drug.species]
    if species:
        parts.append(f"Hedef türler: {', '.join(species)}")
    ingredients = [di.ingredient.name for di in drug.ingredients]
    if ingredients:
        parts.append(f"Etken maddeler: {', '.join(ingredients)}")
    indications = [i.name for i in drug.indications]
    if indications:
        parts.append(f"Endikasyonlar: {', '.join(indications)}")
    if drug.side_effects:
        parts.append(f"Yan etkiler: {drug.side_effects}")
    if drug.contraindications:
        parts.append(f"Kontrendikasyonlar: {drug.contraindications}")
    if drug.interactions:
        parts.append(f"İlaç etkileşimleri: {drug.interactions}")
    if drug.overdose_symptoms:
        parts.append(f"Doz aşımı belirtileri: {drug.overdose_symptoms}")
    if drug.warnings:
        parts.append(f"Uyarılar: {drug.warnings}")
    return "\n".join(parts)


def build_index(batch_size: int = 100):
    db: Session = SessionLocal()
    client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
    collection = get_collection(client)

    total = db.query(Drug).count()
    print(f"Toplam {total} ilaç index'lenecek...")

    offset = 0
    indexed = 0
    while offset < total:
        drugs = db.query(Drug).order_by(Drug.id).offset(offset).limit(batch_size).all()
        if not drugs:
            break

        ids, docs, metas = [], [], []
        for drug in drugs:
            text = drug_to_text(drug)
            ids.append(str(drug.id))
            docs.append(text)
            metas.append({
                "drug_id": drug.id,
                "drug_name": drug.name,
                "spc_url": drug.spc_url or "",
                "pharmacological_class": drug.pharmacological_class or "",
            })

        collection.upsert(ids=ids, documents=docs, metadatas=metas)
        indexed += len(drugs)
        offset += batch_size
        print(f"  {indexed}/{total} ilaç index'lendi...")

    db.close()
    print(f"\nTamamlandı! {indexed} ilaç ChromaDB'ye eklendi.")
    print(f"Konum: {settings.CHROMA_DB_PATH}")


if __name__ == "__main__":
    build_index()
