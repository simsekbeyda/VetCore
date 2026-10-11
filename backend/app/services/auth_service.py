from __future__ import annotations
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token, hash_password, verify_password, create_access_token, create_refresh_token
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

bearer_scheme = HTTPBearer()


def register_user(req: RegisterRequest, db: Session) -> User:
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")
    try:
        role = UserRole(req.role)
    except ValueError:
        role = UserRole.vet
    # Admin hesabı açık kayıtla oluşturulamaz (bkz. scripts/create_admin.py)
    if role == UserRole.admin:
        role = UserRole.vet
    user = User(
        full_name=req.full_name,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(req: LoginRequest, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap devre dışı.")
    data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        role=user.role.value,
    )


def refresh_tokens(refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Geçersiz yenileme tokeni.")
    data = {"sub": payload["sub"], "role": payload["role"]}
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        role=payload["role"],
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Geçersiz token.")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Yalnızca admin erişebilir.")
    return user


def require_vet_or_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in (UserRole.admin, UserRole.vet):
        raise HTTPException(status_code=403, detail="Yetkiniz yok.")
    return user
