"""
Penisilin ilaçlarını veritabanına ekle (yok oldukları için)
Çalıştır: python add_penicillin_drugs.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.models.drug import Drug, Species, Indication, Source

Base.metadata.create_all(bind=engine)

db = Session(engine)

# Kaynak ekle
src = db.query(Source).filter_by(name="Türkiye İlaç Veri Seti").first()
if not src:
    src = Source(name="Türkiye İlaç Veri Seti", url="https://vetcore.com")
    db.add(src)
    db.commit()

# Penisilin ilaçları
PENICILLIN_DRUGS = [
    {"name": "Penicillin V", "turkish_name": "Penisilin V", "trade_names": "Vepen, Vpen", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Bakteri enfeksiyonu"]},
    {"name": "Penicillin G", "turkish_name": "Penisilin G", "trade_names": "Benzathine Penicillin", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Stafilokok enfeksiyonu"]},
    {"name": "Amoxicillin-Clavulanic Acid", "turkish_name": "Amoksisilin-Klavulanik Asit", "trade_names": "Augmentin, Amoxicav", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Bakteri enfeksiyonu"]},
    {"name": "Oxacillin", "turkish_name": "Oksasilin", "trade_names": "Oxacillin", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon"]},
    {"name": "Methicillin", "turkish_name": "Metisilin", "trade_names": "Staphcillin", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["MRSA enfeksiyonu"]},
    {"name": "Cloxacillin", "turkish_name": "Kloksasilin", "trade_names": "Cloxapen", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon"]},
    {"name": "Nafcillin", "turkish_name": "Nafsililin", "trade_names": "Nafcil", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Bakteri enfeksiyonu"]},
    {"name": "Piperacillin", "turkish_name": "Piperasilin", "trade_names": "Pipracil, Piperacillin-Tazobactam", "pharmacological_class": "Beta-lactam antibiotic", "species": ["Köpek", "Kedi"], "indications": ["Geniş spektrumlu enfeksiyon"]},
]

inserted = 0
skipped = 0

for drug_data in PENICILLIN_DRUGS:
    existing = db.query(Drug).filter_by(name=drug_data["name"]).first()
    if existing:
        skipped += 1
        print(f"⊘ {drug_data['name']} zaten var")
        continue
    
    drug = Drug(
        name=drug_data["name"],
        turkish_name=drug_data["turkish_name"],
        trade_names=drug_data["trade_names"],
        pharmacological_class=drug_data["pharmacological_class"],
        source_id=src.id
    )
    
    # Species ekle
    for sp_name in drug_data.get("species", []):
        species = db.query(Species).filter_by(name=sp_name).first()
        if not species:
            species = Species(name=sp_name)
            db.add(species)
            db.flush()
        drug.species.append(species)
    
    # Indications ekle
    for ind_name in drug_data.get("indications", []):
        indication = db.query(Indication).filter_by(name=ind_name).first()
        if not indication:
            indication = Indication(name=ind_name)
            db.add(indication)
            db.flush()
        drug.indications.append(indication)
    
    db.add(drug)
    inserted += 1
    print(f"✓ {drug_data['name']} eklendi")

db.commit()
print(f"\n✅ Penisilin ilaçları eklendi!")
print(f"Eklenen: {inserted} | Zaten var: {skipped}")
