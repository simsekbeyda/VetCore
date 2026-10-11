"""
Türkçe isimli hayvan türlerini de güncelle
Çalıştır: python fix_turkish_species_names.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.drug import Species

with Session(engine) as db:
    # Türkçe isimleri olan türleri bul
    kedi = db.query(Species).filter_by(name="Kedi").first()
    if kedi:
        kedi.turkish_name = "Kedi"
        print("✓ Kedi → Kedi")
    
    kopek = db.query(Species).filter_by(name="Köpek").first()
    if kopek:
        kopek.turkish_name = "Köpek"
        print("✓ Köpek → Köpek")
    
    db.commit()
    
    print(f"\n✅ Tamamlandı!")
    
    # Final check
    all_species = db.query(Species).all()
    with_translation = sum(1 for s in all_species if s.turkish_name)
    print(f"Toplam: {len(all_species)} | Çevirisi olan: {with_translation}")
