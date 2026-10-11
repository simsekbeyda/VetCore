"""
Hayvan türlerini türkçe isimleriyle eşleştir
Çalıştır: python map_turkish_species.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.drug import Species

# İngilizce → Türkçe hayvan türleri
SPECIES_MAPPING = {
    # Domestik
    "Dog": "Köpek",
    "Cat": "Kedi",
    "Horse": "At",
    "Donkey": "Eşek",
    "Mule": "Katır",
    "Cattle": "Sığır",
    "Cow": "İnek",
    "Bull": "Boğa",
    "Ox": "Öküz",
    "Buffalo": "Manda",
    "Sheep": "Koyun",
    "Ram": "Koç",
    "Lamb": "Kuzu",
    "Goat": "Keçi",
    "Buck": "Teke",
    "Kid": "Oğlak",
    "Pig": "Domuz",
    "Boar": "Erkek Domuz",
    "Sow": "Dişi Domuz",
    "Porcine": "Domuz",
    
    # Kanatlı
    "Chicken": "Tavuk",
    "Hen": "Tavuk",
    "Rooster": "Horoz",
    "Turkey": "Hindi",
    "Duck": "Ördek",
    "Goose": "Kaz",
    "Pigeon": "Güvercin",
    "Dove": "Güvercin",
    "Bird": "Kuş",
    
    # Ekzotik
    "Rabbit": "Tavşan",
    "Hare": "Tavşan",
    "Ferret": "Kunduz",
    "Guinea Pig": "Kobay",
    "Hamster": "Hamster",
    "Mouse": "Fare",
    "Rat": "Sıçan",
    
    # Su hayvanları
    "Fish": "Balık",
    "Aquatic": "Su Hayvanları",
    "Reptile": "Sürüngen",
    "Reptiles": "Sürüngenleri",
    
    # Diğer
    "Bovine": "Sığır",
    "Equine": "At Ailesi",
    "Avian": "Kuş",
    "Avian Species": "Kuş Türleri",
    "Exotic": "Egzotik Hayvan",
    "Other": "Diğer",
}

with Session(engine) as db:
    all_species = db.query(Species).all()
    updated = 0
    not_found = []
    
    print(f"\nMevcut hayvan türleri ({len(all_species)} adet):")
    print("=" * 60)
    
    for species in all_species:
        # Eşleştirmeyi bul
        turkish_name = None
        for eng, trk in SPECIES_MAPPING.items():
            if eng.lower() == species.name.lower():
                turkish_name = trk
                break
        
        if turkish_name:
            species.turkish_name = turkish_name
            updated += 1
            print(f"✓ {species.name:<25} → {turkish_name}")
        else:
            not_found.append(species.name)
            print(f"✗ {species.name:<25} (Eşleştirilemedi)")
    
    print("=" * 60)
    db.commit()
    
    print(f"\n✅ Güncelleme tamamlandı!")
    print(f"Eşleştirilen: {updated} | Eşleştirilemeden: {len(not_found)}")
    
    if not_found:
        print(f"\nEşleştirilemedi ({len(not_found)}):")
        for name in not_found:
            print(f"  - {name}")
