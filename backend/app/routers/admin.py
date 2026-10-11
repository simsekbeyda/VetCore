from __future__ import annotations
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth_service import require_admin
from app.services import admin_service as svc
from app.schemas.drug import (
    DrugCreate, DrugUpdate, DrugListOut, DrugDetailOut,
    SpeciesOut, IndicationOut, ActiveIngredientOut, SourceBase, SourceOut,
    DashboardStats,
)
from app.schemas.admin import UserAdminOut, UserRoleUpdate, ImportResult

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


# ── Dashboard ────────────────────────────────────────────
@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    return svc.get_dashboard_stats(db)


# ── Drugs ────────────────────────────────────────────────
@router.get("/drugs")
def list_drugs(
    search: str = "", species_id: int = 0, indication_id: int = 0,
    page: int = 1, size: int = 20, db: Session = Depends(get_db)
):
    return svc.list_drugs(db, search, species_id, indication_id, page, size)

@router.get("/drugs/missing")
def missing_drugs(db: Session = Depends(get_db)):
    return svc.get_missing_drugs(db)

@router.get("/drugs/{drug_id}", response_model=DrugDetailOut)
def get_drug(drug_id: int, db: Session = Depends(get_db)):
    return svc.get_drug(drug_id, db)

@router.post("/drugs", response_model=DrugDetailOut, status_code=201)
def create_drug(data: DrugCreate, db: Session = Depends(get_db)):
    return svc.create_drug(data, db)

@router.put("/drugs/{drug_id}", response_model=DrugDetailOut)
def update_drug(drug_id: int, data: DrugUpdate, db: Session = Depends(get_db)):
    return svc.update_drug(drug_id, data, db)

@router.delete("/drugs/{drug_id}", status_code=204)
def delete_drug(drug_id: int, db: Session = Depends(get_db)):
    svc.delete_drug(drug_id, db)


# ── Species ──────────────────────────────────────────────
@router.get("/species", response_model=list[SpeciesOut])
def list_species(db: Session = Depends(get_db)):
    return svc.list_species(db)

@router.post("/species", response_model=SpeciesOut, status_code=201)
def create_species(body: dict, db: Session = Depends(get_db)):
    return svc.create_species(body["name"], db)

@router.delete("/species/{sid}", status_code=204)
def delete_species(sid: int, db: Session = Depends(get_db)):
    svc.delete_species(sid, db)


# ── Indications ──────────────────────────────────────────
@router.get("/indications", response_model=list[IndicationOut])
def list_indications(db: Session = Depends(get_db)):
    return svc.list_indications(db)

@router.post("/indications", response_model=IndicationOut, status_code=201)
def create_indication(body: dict, db: Session = Depends(get_db)):
    return svc.create_indication(body["name"], db)

@router.delete("/indications/{iid}", status_code=204)
def delete_indication(iid: int, db: Session = Depends(get_db)):
    svc.delete_indication(iid, db)


# ── Active Ingredients ───────────────────────────────────
@router.get("/ingredients", response_model=list[ActiveIngredientOut])
def list_ingredients(search: str = "", db: Session = Depends(get_db)):
    return svc.list_ingredients(db, search)

@router.post("/ingredients", response_model=ActiveIngredientOut, status_code=201)
def create_ingredient(body: dict, db: Session = Depends(get_db)):
    return svc.create_ingredient(body["name"], db)

@router.delete("/ingredients/{aid}", status_code=204)
def delete_ingredient(aid: int, db: Session = Depends(get_db)):
    svc.delete_ingredient(aid, db)


# ── Sources ──────────────────────────────────────────────
@router.get("/sources", response_model=list[SourceOut])
def list_sources(db: Session = Depends(get_db)):
    return svc.list_sources(db)

@router.post("/sources", response_model=SourceOut, status_code=201)
def create_source(body: SourceBase, db: Session = Depends(get_db)):
    return svc.create_source(body.name, body.url, body.document_type, db)

@router.delete("/sources/{sid}", status_code=204)
def delete_source(sid: int, db: Session = Depends(get_db)):
    svc.delete_source(sid, db)


# ── Excel Import ─────────────────────────────────────────
@router.post("/import/excel", response_model=ImportResult)
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    from app.services.import_service import import_drugs_from_excel
    content = await file.read()
    return import_drugs_from_excel(content, db)


# ── Users ────────────────────────────────────────────────
@router.get("/users", response_model=list[UserAdminOut])
def list_users(db: Session = Depends(get_db)):
    return svc.list_users(db)

@router.put("/users/{uid}/role", response_model=UserAdminOut)
def update_user_role(uid: int, body: UserRoleUpdate, db: Session = Depends(get_db)):
    return svc.update_user_role(uid, body.role, body.is_active, db)


# ── Audit Logs ───────────────────────────────────────────
@router.get("/audit-logs")
def list_audit_logs(page: int = 1, size: int = 50, action: str = "", db: Session = Depends(get_db)):
    return svc.list_audit_logs(db, page, size, action)


# ── Chatbot Logs ──────────────────────────────────────────
@router.get("/chatbot-logs")
def list_chatbot_logs(page: int = 1, size: int = 50, user_id: int = 0, db: Session = Depends(get_db)):
    return svc.list_chatbot_logs(db, page, size, user_id)


# ── Therapeutic Groups ────────────────────────────────────
@router.get("/therapeutic-groups")
def list_therapeutic_groups(db: Session = Depends(get_db)):
    return svc.list_therapeutic_groups(db)

@router.get("/therapeutic-groups/{tg_id}")
def get_therapeutic_group(tg_id: int, db: Session = Depends(get_db)):
    return svc.get_therapeutic_group(tg_id, db)

@router.post("/therapeutic-groups", status_code=201)
def create_therapeutic_group(body: dict, db: Session = Depends(get_db)):
    return svc.create_therapeutic_group(body["name"], body.get("description"), db)

@router.put("/therapeutic-groups/{tg_id}")
def update_therapeutic_group(tg_id: int, body: dict, db: Session = Depends(get_db)):
    return svc.update_therapeutic_group(tg_id, body["name"], body.get("description"), db)

@router.delete("/therapeutic-groups/{tg_id}", status_code=204)
def delete_therapeutic_group(tg_id: int, db: Session = Depends(get_db)):
    svc.delete_therapeutic_group(tg_id, db)

@router.post("/therapeutic-groups/{tg_id}/drugs/{drug_id}", status_code=200)
def add_drug_to_group(tg_id: int, drug_id: int, db: Session = Depends(get_db)):
    return svc.add_drug_to_therapeutic_group(tg_id, drug_id, db)

@router.delete("/therapeutic-groups/{tg_id}/drugs/{drug_id}", status_code=204)
def remove_drug_from_group(tg_id: int, drug_id: int, db: Session = Depends(get_db)):
    svc.remove_drug_from_therapeutic_group(tg_id, drug_id, db)
