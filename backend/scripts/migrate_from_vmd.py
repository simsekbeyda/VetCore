"""
vet_db.staging_drugs → vetcore_db migration script
Çalıştır (backend/ içinden): python scripts/migrate_from_vmd.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

# ── Bağlantılar ──────────────────────────────────────────
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from dotenv import load_dotenv
load_dotenv()

# Kaynak VMD veritabanı (.env içinde VMD_SOURCE_DB_URL olarak tanımlayın)
VET_DB = os.environ["VMD_SOURCE_DB_URL"]

src_engine = create_engine(VET_DB)
from app.core.database import engine as dst_engine, Base
from app.models.user import User
from app.models.drug import Drug, ActiveIngredient, DrugIngredient, Species, Indication, Source
from app.models.audit_log import AuditLog

# Tabloları garantile
Base.metadata.create_all(bind=dst_engine)

dst = Session(dst_engine)
src = src_engine.connect()

inserted = updated = skipped = 0

# ── 1. Species ───────────────────────────────────────────
print("Species kopyalanıyor...")
rows = src.execute(text("SELECT name FROM species ORDER BY name")).fetchall()
for (name,) in rows:
    if not dst.query(Species).filter_by(name=name).first():
        dst.add(Species(name=name))
dst.commit()
print(f"  {len(rows)} tür işlendi.")

# ── 2. Active Ingredients (vet_db'den + staging'den) ─────
print("Etken maddeler kopyalanıyor...")
# Önce vet_db active_ingredients
rows = src.execute(text("SELECT name FROM active_ingredients ORDER BY name")).fetchall()
ai_names = set()
for (name,) in rows:
    name = name.strip()[:499]
    if name and name not in ai_names:
        ai_names.add(name)
        if not dst.query(ActiveIngredient).filter_by(name=name).first():
            dst.add(ActiveIngredient(name=name))
# staging'den de unique aktif maddeleri çek ve böl
staging_ai = src.execute(text("SELECT DISTINCT ActiveSubstances FROM staging_drugs WHERE ActiveSubstances IS NOT NULL AND ActiveSubstances != ''")).fetchall()
for (raw,) in staging_ai:
    for part in [p.strip() for p in raw.replace(";", ",").split(",") if p.strip()]:
        part = part[:499]
        if part and part not in ai_names:
            ai_names.add(part)
            if not dst.query(ActiveIngredient).filter_by(name=part).first():
                dst.add(ActiveIngredient(name=part))
dst.commit()
print(f"  {len(ai_names)} etken madde işlendi.")

# ── 3. VMD Kaynak ────────────────────────────────────────
vmd_source = dst.query(Source).filter_by(name="VMD Product Information Database").first()
if not vmd_source:
    vmd_source = Source(
        name="VMD Product Information Database",
        url="https://www.vmd.defra.gov.uk/productinformationdatabase",
        document_type="veri tabanı"
    )
    dst.add(vmd_source)
    dst.commit()

# ── 4. Drugs (staging_drugs → vetcore_db) ─────────────────
print("İlaçlar aktarılıyor...")
staging = src.execute(text("""
    SELECT Name,
           MIN(ActiveSubstances) AS ActiveSubstances,
           MIN(TargetSpecies)    AS TargetSpecies,
           MIN(TherapeuticGroup) AS TherapeuticGroup,
           MIN(SPC_Link)         AS SPC_Link,
           MIN(PharmaceuticalForm) AS PharmaceuticalForm
    FROM staging_drugs
    WHERE Name IS NOT NULL AND Name != ''
    GROUP BY Name
    ORDER BY Name
""")).fetchall()

total = len(staging)
for i, row in enumerate(staging):
    name         = (row[0] or "").strip()
    actives      = (row[1] or "").strip()
    target_sp    = (row[2] or "").strip()
    thera_group  = (row[3] or "").strip()
    spc_link     = (row[4] or "").strip() or None
    pharma_form  = (row[5] or "").strip()

    if not name:
        skipped += 1
        continue

    drug = dst.query(Drug).filter_by(name=name).first()
    is_new = drug is None
    if is_new:
        drug = Drug(name=name)
        dst.add(drug)

    drug.pharmacological_class = thera_group or pharma_form or None
    drug.spc_url = spc_link
    drug.source_id = vmd_source.id

    # Species
    drug.species = []
    for sp_name in [s.strip() for s in target_sp.split("|") if s.strip()]:
        sp = dst.query(Species).filter_by(name=sp_name).first()
        if not sp:
            sp = Species(name=sp_name); dst.add(sp); dst.flush()
        drug.species.append(sp)

    # Active ingredients (virgül veya | ile ayrılmış olabilir)
    dst.query(DrugIngredient).filter_by(drug=drug).delete()
    for ai_name in [a.strip() for a in actives.replace(";", ",").split(",") if a.strip()]:
        ai_name = ai_name[:499]
        ai = dst.query(ActiveIngredient).filter_by(name=ai_name).first()
        if not ai:
            ai = ActiveIngredient(name=ai_name); dst.add(ai); dst.flush()
        dst.add(DrugIngredient(drug=drug, ingredient=ai))

    dst.flush()
    inserted += 1 if is_new else 0
    updated  += 0 if is_new else 1

    if (i + 1) % 200 == 0:
        dst.commit()
        print(f"  {i+1}/{total} işlendi...")

dst.commit()
print(f"\nTamamlandı!")
print(f"  Eklenen  : {inserted}")
print(f"  Güncellenen: {updated}")
print(f"  Atlanan  : {skipped}")
src.close()
dst.close()
