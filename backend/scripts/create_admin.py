"""
İlk admin kullanıcısını oluşturur (veya mevcut kullanıcıyı admin yapar).
Çalıştır (backend/ içinden): python scripts/create_admin.py <email> <şifre> [ad soyad]
"""
import os, sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ".")

from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.core.security import hash_password
import app.models  # noqa: F401  (tüm modelleri kaydet)
from app.models.user import User, UserRole

if len(sys.argv) < 3:
    print("Kullanım: python scripts/create_admin.py <email> <şifre> [ad soyad]")
    sys.exit(1)

email, password = sys.argv[1], sys.argv[2]
full_name = sys.argv[3] if len(sys.argv) > 3 else "Admin"

Base.metadata.create_all(bind=engine)

with Session(engine) as db:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.role = UserRole.admin
        print(f"Mevcut kullanıcı admin yapıldı: {email}")
    else:
        db.add(User(full_name=full_name, email=email,
                    hashed_password=hash_password(password), role=UserRole.admin))
        print(f"Admin oluşturuldu: {email}")
    db.commit()
