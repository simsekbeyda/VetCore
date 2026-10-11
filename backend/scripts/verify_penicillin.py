"""
Penisilin ilaçlarını doğrula
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.drug import Drug
from sqlalchemy import select

with Session(engine) as db:
    # Tüm penisilin ilaçlarını bul
    query = select(Drug).where(
        (Drug.name.ilike("%Penicillin%")) |
        (Drug.name.ilike("%Amoxicillin%")) |
        (Drug.name.ilike("%Oxacillin%")) |
        (Drug.name.ilike("%Methicillin%")) |
        (Drug.name.ilike("%Nafcillin%")) |
        (Drug.name.ilike("%Piperacillin%")) |
        (Drug.name.ilike("%Cloxacillin%"))
    )
    
    drugs = db.execute(query).scalars().all()
    
    print(f"\n✅ Penisilin ilaçları ({len(drugs)} adet):")
    print("=" * 60)
    for drug in drugs:
        turkish = drug.turkish_name or "Yok"
        print(f"  {drug.name:<35} → {turkish}")
    print("=" * 60)
    
    # Detay
    if len(drugs) > 0:
        drug = drugs[0]
        print(f"\nİlk ilaçın detayı:")
        print(f"  ID: {drug.id}")
        print(f"  Name: {drug.name}")
        print(f"  Turkish Name: {drug.turkish_name}")
        print(f"  Description: {drug.description[:100] if drug.description else 'Yok'}...")
        print(f"  Trade Names: {drug.trade_names if drug.trade_names else 'Yok'}")
