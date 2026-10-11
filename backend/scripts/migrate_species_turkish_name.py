"""
Species tablosuna turkish_name sütunu ekle
Çalıştır: python migrate_species_turkish_name.py
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    # turkish_name sütunu zaten var mı kontrol et
    result = conn.execute(text("""
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='species' AND COLUMN_NAME='turkish_name'
    """))
    
    column_exists = result.fetchone() is not None
    
    if not column_exists:
        print("turkish_name sütunu ekleniyor...")
        conn.execute(text("""
            ALTER TABLE species 
            ADD COLUMN turkish_name VARCHAR(100) NULL,
            ADD INDEX idx_species_turkish_name (turkish_name)
        """))
        conn.commit()
        print("✓ Sütun eklendi!")
    else:
        print("turkish_name sütunu zaten var!")
