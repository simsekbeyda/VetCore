"""
Yabancı ilaçları Türkçe adlarıyla eşleştir (turkish_name field'ını doldur)
Veri kaybı OLMAZ - sadece turkish_name field'ı güncellenir
Çalıştır: python map_turkish_drugs.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy import text
from app.core.database import engine

# İngilizce → Türkçe eşleştirme (yaygın veteriner ilaçları)
DRUG_MAPPING = {
    # Antibiyotikler
    "Amoxicillin": "Amoksisilin",
    "Ampicillin": "Ampisilin",
    "Tetracycline": "Tetrasiklin",
    "Ciprofloxacin": "Siprofloksasin",
    "Enrofloxacin": "Enrofloksasin",
    "Doxycycline": "Doksisiklin",
    "Cephalexin": "Sefaleksin",
    "Trimethoprim": "Trimetoprim",
    "Sulfonamide": "Sulfonamid",
    "Penicillin": "Penisilin",
    "Erythromycin": "Eritromisin",
    "Fluoroquinolone": "Fluorokuinolon",
    
    # Ağrı Kesici & Anti-enflamatuar
    "Paracetamol": "Parasetamol",
    "Acetaminophen": "Asetaminofen",
    "Ibuprofen": "İbuprofen",
    "Meloxicam": "Meloksikam",
    "Ketoprofen": "Ketoprofen",
    "Aspirin": "Aspirin",
    "Naproxen": "Naproksen",
    "Piroxicam": "Piroksikam",
    "Indomethacin": "İndometasin",
    
    # Kortikosteroidler
    "Dexamethasone": "Deksametazon",
    "Prednisone": "Prednison",
    "Prednisolone": "Prednizolon",
    "Methylprednisolone": "Metilprednizolon",
    "Triamcinolone": "Triamsinolon",
    "Hydrocortisone": "Hidrokortison",
    "Betamethasone": "Betametazon",
    
    # Antihelmintikler (Parazit ilacı)
    "Albendazole": "Albendazol",
    "Ivermectin": "İvermektin",
    "Praziquantel": "Prazikvantel",
    "Levamisole": "Levamisol",
    "Mebendazole": "Mebendazol",
    "Fenbendazole": "Fenbendazol",
    "Pyrantel": "Pirantel",
    
    # Antihistaminikler
    "Diphenhydramine": "Difenhidramin",
    "Cetirizine": "Setirizin",
    "Chlorpheniramine": "Klorfenil amin",
    "Hydroxyzine": "Hidroksizin",
    "Promethazine": "Prometazin",
    
    # Mide/Sindirim
    "Omeprazole": "Omeprazol",
    "Ranitidine": "Ranitidin",
    "Famotidine": "Famotidin",
    "Metoclopramide": "Metoklopramid",
    "Domperidone": "Domperidon",
    "Cisapride": "Cisaprid",
    
    # Kalp & Kan Basıncı
    "Amlodipine": "Amlodipin",
    "Atenolol": "Atenolol",
    "Pimobendan": "Pimobendan",
    "Diltiazem": "Diltiazem",
    "Verapamil": "Verapamil",
    "Lisinopril": "Lisinopril",
    "Benazepril": "Benazepril",
    "Furosemide": "Furosemid",
    "Spironolactone": "Spironolakton",
    "Hydrochlorothiazide": "Hidroklorotiazid",
    
    # Anestezi/Sedasyon
    "Ketamine": "Ketamin",
    "Propofol": "Propofol",
    "Dexmedetomidine": "Deksmedetomidin",
    "Xylazine": "Ksilazin",
    "Thiopental": "Tiyo pental",
    "Isoflurane": "İzofluran",
    "Sevoflurane": "Sevofluran",
    
    # Antitoksin & Toksisite
    "Activated Charcoal": "Aktif Kömür",
    "Naloxone": "Nalokson",
    "Flumazenil": "Flumazenil",
    "Atipamezole": "Atipamazol",
    
    # Santral Sinir Sistemi
    "Phenobarbital": "Fenobarb ital",
    "Diazepam": "Diyazepam",
    "Lorazepam": "Lorazepam",
    "Midazolam": "Midazolam",
    "Levetiracetam": "Levetirasetam",
    
    # Vitamin & Mineral
    "Vitamin A": "A Vitamini",
    "Vitamin D": "D Vitamini",
    "Vitamin E": "E Vitamini",
    "Vitamin B12": "B12 Vitamini",
    "Thiamine": "Tiamin",
    "Calcium": "Kalsiyum",
    "Magnesium": "Magnezyum",
    "Zinc": "Çinko",
    "Iron": "Demir",
    
    # Üriner Sistem
    "Urinary Acidifier": "İdrar Asidifi yer",
    "Urinary Alkalinizer": "İdrar Alkali ni zer",
    
    # Göz Tedavisi
    "Pilocarpine": "Pilokarpin",
    "Timolol": "Timolol",
    "Latanoprost": "Latanoprost",
    "Dorzolamide": "Dorzolamid",
    "Tropicamide": "Tropikamidd",
    "Phenylephrine": "Fenilefrin",
}

db = engine.connect()

# Sayıcılar
updated = 0
total_drugs = 0

try:
    # Toplam ilaç sayısı
    result = db.execute(text("SELECT COUNT(*) FROM drugs"))
    total_drugs = result.scalar()
    print(f"Toplam ilaç: {total_drugs}")
    
    # Eşleştirme yap
    for eng_name, tr_name in DRUG_MAPPING.items():
        result = db.execute(text(
            "UPDATE drugs SET turkish_name = :tr WHERE name LIKE :eng"
        ), {"tr": tr_name, "eng": f"%{eng_name}%"})
        
        if result.rowcount > 0:
            updated += result.rowcount
            print(f"✓ '{eng_name}' → '{tr_name}' ({result.rowcount} ilaç)")
    
    db.commit()
    
    # Türkçe adı olan ilaçları say
    result = db.execute(text("SELECT COUNT(*) FROM drugs WHERE turkish_name IS NOT NULL"))
    tr_count = result.scalar()
    
    print(f"\n✅ Eşleştirme tamamlandı!")
    print(f"Güncellenen: {updated} ilaç")
    print(f"Türkçe adlı ilaçlar: {tr_count}/{total_drugs} ({tr_count*100//total_drugs}%)")
    
except Exception as e:
    print(f"❌ Hata: {e}")
    db.rollback()
finally:
    db.close()
