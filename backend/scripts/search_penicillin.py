import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from app.core.database import engine
from sqlalchemy import text

conn = engine.connect()

# Penisilin ile ilgili tüm ilaçları ara
r = conn.execute(text("""
    SELECT id, name, pharmacological_class FROM drugs 
    WHERE pharmacological_class LIKE '%penicilin%' 
    OR pharmacological_class LIKE '%Penicillin%'
    OR name LIKE '%V%' AND pharmacological_class LIKE '%beta-lactam%'
    LIMIT 20
"""))
rows = r.fetchall()
print(f"Pharmacological class'ta penisilin: {len(rows)}")
for id, name, cls in rows:
    print(f"{id} - {name} ({cls})")

# Aktif ingredient'lerde penisilin ara
r2 = conn.execute(text("""
    SELECT DISTINCT d.id, d.name, ai.name as ingredient
    FROM drugs d
    JOIN drug_ingredient di ON d.id = di.drug_id
    JOIN active_ingredients ai ON di.ingredient_id = ai.id
    WHERE ai.name LIKE '%Penicillin%' OR ai.name LIKE '%Penisilin%'
    LIMIT 20
"""))
rows2 = r2.fetchall()
print(f"\n\nEtken madde'de penisilin: {len(rows2)}")
for id, name, ingredient in rows2:
    print(f"{id} - {name} (ingredient: {ingredient})")

conn.close()
