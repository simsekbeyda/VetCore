from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from app.services.auth_service import get_current_user, login_user, refresh_tokens, register_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(req, db)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return login_user(req, db)


@router.post("/refresh", response_model=TokenResponse)
def refresh(req: RefreshRequest):
    return refresh_tokens(req.refresh_token)


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user
