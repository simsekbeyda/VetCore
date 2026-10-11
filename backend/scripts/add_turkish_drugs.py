"""
Türkiye'deki yaygın veteriner ilaçlarını veritabanına ekle
Çalıştır: python add_turkish_drugs.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.models.drug import Drug, Species, Indication, ActiveIngredient, Source

# Tabloları garantile
Base.metadata.create_all(bind=engine)

db = Session(engine)

# Kaynaklar
src = db.query(Source).filter_by(name="Türkiye İlaç Veri Seti").first()
if not src:
    src = Source(name="Türkiye İlaç Veri Seti", url="https://vetcore.com")
    db.add(src)
    db.commit()

# Türkiye ilaçları (gerçekçi veteriner ilaçları)
TURKISH_DRUGS = [
    # Antibiyotikler
    {"name": "Amoksisilin", "trade_names": "Alfamox, Amoxykar", "pharmacological_class": "Beta-laktam antibiyotik", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["Enfeksiyon", "Bakteriyel enfeksiyon"], "ingredients": [{"name": "Amoksisilin", "amount": "250mg"}]},
    {"name": "Ampisilin", "trade_names": "Ampicin, Penibrock", "pharmacological_class": "Beta-laktam antibiyotik", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Bakteri enfeksiyonu"], "ingredients": [{"name": "Ampisilin", "amount": "500mg"}]},
    {"name": "Tetrasiklin", "trade_names": "Tetracyn, Doxyvet", "pharmacological_class": "Tetrasiklen antibiyotik", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["Enfeksiyon", "Respiratuar enfeksiyon"], "ingredients": [{"name": "Tetrasiklin HCl", "amount": "250mg"}]},
    {"name": "Siprofloksasin", "trade_names": "Cipro, Floxet", "pharmacological_class": "Fluorokuinolon antibiyotik", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Idrar yolu enfeksiyonu"], "ingredients": [{"name": "Siprofloksasin", "amount": "250mg"}]},
    {"name": "Enrofloksasin", "trade_names": "Baytril, Flosar", "pharmacological_class": "Fluorokuinolon antibiyotik", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["Enfeksiyon", "Bakteri enfeksiyonu"], "ingredients": [{"name": "Enrofloksasin", "amount": "100mg"}]},
    {"name": "Doksisiklin", "trade_names": "Doxylin, Doxoral", "pharmacological_class": "Tetrasiklen antibiyotik", "species": ["Köpek", "Kedi"], "indications": ["Enfeksiyon", "Lyme hastalığı"], "ingredients": [{"name": "Doksisiklin monohidrat", "amount": "100mg"}]},
    
    # Ağrı Kesici & Anti-enflamatuar
    {"name": "Paracetamol", "trade_names": "Tylenol Vet, Apamol", "pharmacological_class": "Analjezik", "species": ["Köpek", "Kedi"], "indications": ["Ağrı", "Ateş"], "ingredients": [{"name": "Paracetamol", "amount": "500mg"}]},
    {"name": "İbuprofen", "trade_names": "Brufen Vet, Ibukem", "pharmacological_class": "NSAID", "species": ["Köpek", "Kedi"], "indications": ["Ağrı", "İltihap"], "ingredients": [{"name": "İbuprofen", "amount": "200mg"}]},
    {"name": "Meloksikam", "trade_names": "Metacam, Meloxovet", "pharmacological_class": "NSAID", "species": ["Köpek", "Kedi"], "indications": ["Ağrı", "Osteoartrit"], "ingredients": [{"name": "Meloksikam", "amount": "1.5mg"}]},
    {"name": "Ketoprofen", "trade_names": "Ketofen, Ketoven", "pharmacological_class": "NSAID", "species": ["Köpek", "Kedi"], "indications": ["Ağrı", "Yangı"], "ingredients": [{"name": "Ketoprofen", "amount": "10mg"}]},
    {"name": "Aspirin", "trade_names": "Aspirin Vet, Kardioaspirin", "pharmacological_class": "Analjezik", "species": ["Köpek", "Kedi"], "indications": ["Ağrı", "Pıhtılaşma"], "ingredients": [{"name": "Asetilsalisilik asit", "amount": "300mg"}]},
    
    # Kortikosteroidler
    {"name": "Deksametazon", "trade_names": "Dexadreson, Dexavet", "pharmacological_class": "Kortikosteroid", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["İltihap", "Şok", "Alerji"], "ingredients": [{"name": "Deksametazon", "amount": "2mg"}]},
    {"name": "Prednison", "trade_names": "Prednisone, Predonil", "pharmacological_class": "Kortikosteroid", "species": ["Köpek", "Kedi"], "indications": ["İltihap", "İmmün hastalık"], "ingredients": [{"name": "Prednison", "amount": "5mg"}]},
    {"name": "Metilprednizolon", "trade_names": "Medrol, Metivet", "pharmacological_class": "Kortikosteroid", "species": ["Köpek", "Kedi"], "indications": ["İltihap", "Aller"], "ingredients": [{"name": "Metilprednizolon", "amount": "4mg"}]},
    
    # Antihelmintikler (Parazit ilacı)
    {"name": "Albendazol", "trade_names": "Valbazen, Albevet", "pharmacological_class": "Antelmintik", "species": ["Köpek", "Kedi"], "indications": ["Parazit", "Helmint enfeksiyonu"], "ingredients": [{"name": "Albendazol", "amount": "100mg"}]},
    {"name": "İvermektin", "trade_names": "Ivomec, Stromectol", "pharmacological_class": "Antiparaziter", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["Parazit", "Akar"], "ingredients": [{"name": "İvermektin", "amount": "1mg"}]},
    {"name": "Prazikvantel", "trade_names": "Droncit, Praziquantel", "pharmacological_class": "Antelmintik", "species": ["Köpek", "Kedi"], "indications": ["Parazit", "Bant kurtları"], "ingredients": [{"name": "Prazikvantel", "amount": "50mg"}]},
    
    # Antihistaminikler
    {"name": "Difenhidramin", "trade_names": "Benadryl Vet, Diphenvet", "pharmacological_class": "Antihistaminik", "species": ["Köpek", "Kedi"], "indications": ["Alerji", "Kaşıntı"], "ingredients": [{"name": "Difenhidramin HCl", "amount": "25mg"}]},
    {"name": "Setirizin", "trade_names": "Zyrtec Vet, Cetirin", "pharmacological_class": "Antihistaminik", "species": ["Köpek", "Kedi"], "indications": ["Alerji", "Atopik dermatit"], "ingredients": [{"name": "Setirizin HCl", "amount": "10mg"}]},
    
    # Mide/Sindirim
    {"name": "Omeprazol", "trade_names": "Prilosec, Omepvet", "pharmacological_class": "PPI", "species": ["Köpek", "Kedi"], "indications": ["Mide ülseri", "Reflü"], "ingredients": [{"name": "Omeprazol", "amount": "20mg"}]},
    {"name": "Ranitidin", "trade_names": "Zantac, Ranitidine", "pharmacological_class": "H2 reseptör antagonisti", "species": ["Köpek", "Kedi"], "indications": ["Mide ülseri", "Reflü"], "ingredients": [{"name": "Ranitidin", "amount": "150mg"}]},
    {"name": "Metoklopramid", "trade_names": "Reglan, Metoprol", "pharmacological_class": "Prokinetik", "species": ["Köpek", "Kedi"], "indications": ["Bulantı", "İshal"], "ingredients": [{"name": "Metoklopramid", "amount": "10mg"}]},
    
    # Kalp & Kan Basıncı
    {"name": "Amlodipine", "trade_names": "Norvasc, Amlocard", "pharmacological_class": "Kalsiyum kanal blokörü", "species": ["Kedi"], "indications": ["Hipertansiyon", "Kalp"], "ingredients": [{"name": "Amlodipin besylat", "amount": "2.5mg"}]},
    {"name": "Atenolol", "trade_names": "Tenormin, Aterol", "pharmacological_class": "Beta blokeri", "species": ["Köpek", "Kedi"], "indications": ["Aritmia", "Hipertansiyon"], "ingredients": [{"name": "Atenolol", "amount": "50mg"}]},
    {"name": "Pimobendan", "trade_names": "Vetmedin, Pimopet", "pharmacological_class": "Inotropik ajan", "species": ["Köpek", "Kedi"], "indications": ["Kalp yetersizliği", "Kardiomiyopati"], "ingredients": [{"name": "Pimobendan", "amount": "1.25mg"}]},
    
    # Diüretikler
    {"name": "Furosemid", "trade_names": "Lasix, Furosemide", "pharmacological_class": "Loop diüretik", "species": ["Köpek", "Kedi"], "indications": ["Ödem", "Kalp yetersizliği"], "ingredients": [{"name": "Furosemid", "amount": "20mg"}]},
    {"name": "Spironolakton", "trade_names": "Aldactone, Spiron", "pharmacological_class": "Antialdosteron", "species": ["Köpek", "Kedi"], "indications": ["Şişkinlik", "Kalp"], "ingredients": [{"name": "Spironolakton", "amount": "25mg"}]},
    
    # Anestezi/Sedasyon
    {"name": "Ketamin", "trade_names": "Ketalar, Ketovet", "pharmacological_class": "Dissosiatif anestezik", "species": ["Köpek", "Kedi", "Kuş"], "indications": ["Anestezi", "Sedasyon"], "ingredients": [{"name": "Ketamin HCl", "amount": "50mg"}]},
    {"name": "Propofol", "trade_names": "Diprivan, Propofet", "pharmacological_class": "IV anestezik", "species": ["Köpek", "Kedi"], "indications": ["Anestezi", "Sedasyon"], "ingredients": [{"name": "Propofol", "amount": "10mg"}]},
    {"name": "Deksmedetomidin", "trade_names": "Dexdomitor, Dexmedet", "pharmacological_class": "Alfa-2 agonist", "species": ["Köpek", "Kedi"], "indications": ["Sedasyon", "Anestezi"], "ingredients": [{"name": "Deksmedetomidin HCl", "amount": "0.5mg"}]},
    
    # Toksisite Antidotu
    {"name": "Aktif Kömür", "trade_names": "Carbovet, Activated Charcoal", "pharmacological_class": "Toksik giderici", "species": ["Köpek", "Kedi"], "indications": ["Zehirlenme", "Toksisite"], "ingredients": [{"name": "Aktif kömür", "amount": "500mg"}]},
    {"name": "Nalokson", "trade_names": "Narcan, Naloxone", "pharmacological_class": "Opioid antagonisti", "species": ["Köpek", "Kedi"], "indications": ["Opioid zehirlenmesi", "Overdoz"], "ingredients": [{"name": "Nalokson HCl", "amount": "0.4mg"}]},
]

# Veritabanına ekle
inserted = 0
skipped = 0

for drug_data in TURKISH_DRUGS:
    # Zaten var mı kontrol et
    existing = db.query(Drug).filter_by(name=drug_data["name"]).first()
    if existing:
        skipped += 1
        continue
    
    # Yeni ilaç oluştur
    drug = Drug(
        name=drug_data["name"],
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
    
    # Ingredients ekle
    from app.models.drug import DrugIngredient
    for ing_data in drug_data.get("ingredients", []):
        ai = db.query(ActiveIngredient).filter_by(name=ing_data["name"]).first()
        if not ai:
            ai = ActiveIngredient(name=ing_data["name"])
            db.add(ai)
            db.flush()
        
        drug_ing = DrugIngredient(
            drug=drug,
            ingredient=ai,
            amount=ing_data.get("amount", "")
        )
        db.add(drug_ing)
    
    db.add(drug)
    inserted += 1
    
    if inserted % 5 == 0:
        print(f"  {inserted} ilaç eklendi...")

db.commit()
print(f"\n✅ Türkiye ilaçları başarıyla eklendi!")
print(f"Eklenen: {inserted} | Zaten var: {skipped}")
print(f"Toplam: {db.query(Drug).count()} ilaç")
