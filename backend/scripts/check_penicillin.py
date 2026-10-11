import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from app.core.database import engine
from sqlalchemy import text

conn = engine.connect()
r = conn.execute(text("SELECT id, name, turkish_name FROM drugs WHERE name LIKE '%Penicillin%' OR name LIKE '%Penisilin%' LIMIT 10"))
rows = r.fetchall()

print(f"Bulundu: {len(rows)} penisilin ilaci")
for id, name, turkish_name in rows:
    print(f"{id} - {name} ({turkish_name})")

conn.close()
