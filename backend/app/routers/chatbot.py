from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth_service import get_current_user, require_admin
from app.services import chatbot_service as svc
from app.models.user import User

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask(req: QuestionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not req.question.strip():
        return {"answer": "Lütfen bir soru yazın.", "sources": [], "found": False}
    return svc.ask(req.question.strip(), user.id, db)


@router.get("/logs")
def get_logs(page: int = 1, size: int = 50, db: Session = Depends(get_db), _=Depends(require_admin)):
    return svc.get_logs(db, page, size)
