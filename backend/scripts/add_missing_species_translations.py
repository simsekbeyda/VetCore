"""
Eşleştirilememiş hayvan türlerini de ekle
Çalıştır: python add_missing_species_translations.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.drug import Species

# Eşleştirilememiş türleri manuel olarak ekle
ADDITIONAL_MAPPING = {
    "atlantic_salmon": "Atlantik Salmonu",
    "badger": "Ödek",
    "bearded_dragon": "Sakallı İguana",
    "budgerigar": "Muhabbet Kuşu",
    "canary": "Sarı Kuş",
    "chicken_embryo": "Tavuk Embriyosu",
    "chinchilla": "Çinçilla",
    "deer": "Geyik",
    "fox": "Tilki",
    "frog": "Kurbağa",
    "gerbil": "Jerbil",
    "guinea_fowl": "Ginne Tavuğu",
    "guinea_pig": "Kobay",
    "honey_bee": "Bal Arısı",
    "lizard": "Kertenkele",
    "mink": "Vizon",
    "ornamental_fish": "Dekoratif Balık",
    "partridge": "Keklik",
    "pheasant": "Sülün",
    "polecat": "Yaban Kedi",
    "quail": "Bıldırcın",
    "snake": "Yılan",
    "tortoise": "Kaplumbağa (Kara)",
    "trout": "Alabalık",
    "turtle": "Kaplumbağa (Su)",
    "unknown": "Bilinmeyen",
}

with Session(engine) as db:
    updated = 0
    
    print(f"\nEksik hayvan türlerini ekleniyor...")
    print("=" * 60)
    
    for eng_name, turkish_name in ADDITIONAL_MAPPING.items():
        species = db.query(Species).filter_by(name=eng_name).first()
        if species and not species.turkish_name:
            species.turkish_name = turkish_name
            updated += 1
            print(f"✓ {eng_name:<25} → {turkish_name}")
        elif species:
            print(f"⊙ {eng_name:<25} → {species.turkish_name} (zaten var)")
    
    print("=" * 60)
    db.commit()
    
    print(f"\n✅ Güncelleme tamamlandı!")
    print(f"Eklenen: {updated}")
    
    # Final verification
    print(f"\nTüm türler ({len(db.query(Species).all())} adet):")
    for species in sorted(db.query(Species).all(), key=lambda s: s.name):
        if species.turkish_name:
            print(f"  ✓ {species.name:<25} → {species.turkish_name}")
        else:
            print(f"  ✗ {species.name:<25} (Çevirisi yok)")
