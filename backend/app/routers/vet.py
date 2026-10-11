from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth_service import get_current_user, require_vet_or_admin
from app.services import vet_service as svc
from app.models.user import User
from app.schemas.anamnez import AnamnezRequest, AnamnezAnalysisResponse
from app.services import anamnez_service

router = APIRouter(prefix="/vet", tags=["Vet"])


# ── İlaç Arama & Listeleme ───────────────────────────────
@router.get("/drugs")
def search_drugs(
    search: str = "",
    species_id: int = 0,
    indication_id: int = 0,
    therapeutic_group: str = "",
    pharmaceutical_form: str = "",
    ingredient_id: int = 0,
    trade_names_only: bool = False,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(require_vet_or_admin),
):
    return svc.search_drugs(db, search, species_id, indication_id,
                            therapeutic_group, pharmaceutical_form, ingredient_id, page, size, trade_names_only)


@router.get("/drugs/{drug_id}")
def get_drug(drug_id: int, db: Session = Depends(get_db), user: User = Depends(require_vet_or_admin)):
    return svc.get_drug_detail(drug_id, db)


# ── Filter Options ───────────────────────────────────────
@router.get("/filters/species")
def get_species(db: Session = Depends(get_db), user: User = Depends(require_vet_or_admin)):
    return svc.get_species(db)


@router.get("/filters/indications")
def get_indications(db: Session = Depends(get_db), user: User = Depends(require_vet_or_admin)):
    return svc.get_indications(db)


@router.get("/filters/therapeutic-groups")
def get_therapeutic_groups(db: Session = Depends(get_db), user: User = Depends(require_vet_or_admin)):
    return svc.get_therapeutic_groups(db)


@router.get("/filters/pharmaceutical-forms")
def get_pharmaceutical_forms(db: Session = Depends(get_db), user: User = Depends(require_vet_or_admin)):
    return svc.get_pharmaceutical_forms(db)


# ── Favoriler ────────────────────────────────────────────
@router.get("/favorites")
def get_favorites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.get_favorites(user.id, db)


@router.post("/favorites/{drug_id}", status_code=201)
def add_favorite(drug_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return svc.add_favorite(user.id, drug_id, db)


@router.delete("/favorites/{drug_id}", status_code=204)
def remove_favorite(drug_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    svc.remove_favorite(user.id, drug_id, db)


# ── Anamnez & AI Analiz ──────────────────────────────────
@router.post("/anamnez/analyze", response_model=AnamnezAnalysisResponse)
def analyze_anamnez(req: AnamnezRequest, user: User = Depends(require_vet_or_admin)):
    return anamnez_service.analyze(req)
