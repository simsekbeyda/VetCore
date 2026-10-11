from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.owner import Pet, VetVisit, MedicationRecord, MedicationSchedule

router = APIRouter(prefix="/owner", tags=["Owner"])


# ── Şemalar ──────────────────────────────────────────────
class PetIn(BaseModel):
    name: str
    species: str
    breed: str | None = None
    gender: str | None = None
    birth_date: str | None = None
    weight: float | None = None
    color: str | None = None
    notes: str | None = None

class VisitIn(BaseModel):
    visit_date: str
    vet_name: str | None = None
    clinic: str | None = None
    reason: str | None = None
    diagnosis: str | None = None
    treatment: str | None = None
    notes: str | None = None
    next_visit: str | None = None

class MedRecordIn(BaseModel):
    drug_name: str
    dose: str | None = None
    start_date: str
    end_date: str | None = None
    prescribed_by: str | None = None
    notes: str | None = None

class ScheduleIn(BaseModel):
    drug_name: str
    dose: str | None = None
    frequency: str
    times: str
    start_date: str
    end_date: str | None = None
    notes: str | None = None

class ProfileUpdate(BaseModel):
    full_name: str


# ── Profil ───────────────────────────────────────────────
@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}

@router.put("/profile")
def update_profile(body: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.full_name = body.full_name
    db.commit()
    return {"id": user.id, "full_name": user.full_name, "email": user.email}


# ── Hayvanlar ────────────────────────────────────────────
@router.get("/pets")
def list_pets(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    pets = db.query(Pet).filter(Pet.owner_id == user.id).all()
    return [_pet_out(p) for p in pets]

@router.post("/pets", status_code=201)
def create_pet(body: PetIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    pet = Pet(owner_id=user.id, **body.model_dump())
    db.add(pet); db.commit(); db.refresh(pet)
    return _pet_out(pet)

@router.put("/pets/{pet_id}")
def update_pet(pet_id: int, body: PetIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    pet = _get_pet(pet_id, user.id, db)
    for k, v in body.model_dump().items():
        setattr(pet, k, v)
    db.commit(); db.refresh(pet)
    return _pet_out(pet)

@router.delete("/pets/{pet_id}", status_code=204)
def delete_pet(pet_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    pet = _get_pet(pet_id, user.id, db)
    db.delete(pet); db.commit()


# ── Ziyaret Geçmişi ──────────────────────────────────────
@router.get("/pets/{pet_id}/visits")
def list_visits(pet_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    return db.query(VetVisit).filter(VetVisit.pet_id == pet_id).order_by(VetVisit.visit_date.desc()).all()

@router.post("/pets/{pet_id}/visits", status_code=201)
def add_visit(pet_id: int, body: VisitIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    v = VetVisit(pet_id=pet_id, **body.model_dump())
    db.add(v); db.commit(); db.refresh(v)
    return v

@router.delete("/pets/{pet_id}/visits/{visit_id}", status_code=204)
def delete_visit(pet_id: int, visit_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    v = db.query(VetVisit).filter_by(id=visit_id, pet_id=pet_id).first()
    if v: db.delete(v); db.commit()


# ── İlaç Kayıtları ───────────────────────────────────────
@router.get("/pets/{pet_id}/medications")
def list_medications(pet_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    return db.query(MedicationRecord).filter(MedicationRecord.pet_id == pet_id).order_by(MedicationRecord.start_date.desc()).all()

@router.post("/pets/{pet_id}/medications", status_code=201)
def add_medication(pet_id: int, body: MedRecordIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    m = MedicationRecord(pet_id=pet_id, **body.model_dump())
    db.add(m); db.commit(); db.refresh(m)
    return m

@router.delete("/pets/{pet_id}/medications/{med_id}", status_code=204)
def delete_medication(pet_id: int, med_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    m = db.query(MedicationRecord).filter_by(id=med_id, pet_id=pet_id).first()
    if m: db.delete(m); db.commit()


# ── İlaç Takvimi ─────────────────────────────────────────
@router.get("/pets/{pet_id}/schedules")
def list_schedules(pet_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    return db.query(MedicationSchedule).filter(MedicationSchedule.pet_id == pet_id).all()

@router.post("/pets/{pet_id}/schedules", status_code=201)
def add_schedule(pet_id: int, body: ScheduleIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    s = MedicationSchedule(pet_id=pet_id, **body.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.put("/pets/{pet_id}/schedules/{sch_id}/toggle")
def toggle_schedule(pet_id: int, sch_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    s = db.query(MedicationSchedule).filter_by(id=sch_id, pet_id=pet_id).first()
    if s: s.is_active = not s.is_active; db.commit()
    return s

@router.delete("/pets/{pet_id}/schedules/{sch_id}", status_code=204)
def delete_schedule(pet_id: int, sch_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _get_pet(pet_id, user.id, db)
    s = db.query(MedicationSchedule).filter_by(id=sch_id, pet_id=pet_id).first()
    if s: db.delete(s); db.commit()


# ── İlaç Listesi & Arama (owner için) ───────────────────
@router.get("/drugs")
def list_drugs_simple(search: str = "", page: int = 1, size: int = 30, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.drug import Drug
    q = db.query(Drug)
    if search and len(search) >= 2:
        q = q.filter(Drug.name.ilike(f"%{search}%"))
    total = q.count()
    drugs = q.order_by(Drug.name).offset((page - 1) * size).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [{"id": d.id, "name": d.name, "pharmacological_class": d.pharmacological_class,
                   "species": [s.turkish_name or s.name for s in d.species], "spc_url": d.spc_url} for d in drugs]
    }

@router.get("/drugs/search")
def search_drugs_simple(search: str = "", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.drug import Drug
    if not search or len(search) < 2:
        return []
    drugs = db.query(Drug).filter(Drug.name.ilike(f"%{search}%")).limit(10).all()
    return [{"id": d.id, "name": d.name, "pharmacological_class": d.pharmacological_class,
             "species": [s.turkish_name or s.name for s in d.species], "spc_url": d.spc_url} for d in drugs]

@router.get("/drugs/{drug_id}")
def get_drug_detail(drug_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.drug import Drug
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(404, "İlaç bulunamadı.")
    return {
        "id": drug.id,
        "name": drug.name,
        "trade_names": drug.trade_names,
        "pharmacological_class": drug.pharmacological_class,
        "species": [s.turkish_name or s.name for s in drug.species],
        "indications": [ind.name for ind in drug.indications],
        "ingredients": [{"name": ing.ingredient.name, "amount": ing.amount} for ing in drug.ingredients],
        "side_effects": drug.side_effects,
        "contraindications": drug.contraindications,
        "warnings": drug.warnings,
        "spc_url": drug.spc_url,
    }


# ── Yardımcı ─────────────────────────────────────────────
def _get_pet(pet_id: int, user_id: int, db: Session) -> Pet:
    pet = db.query(Pet).filter_by(id=pet_id, owner_id=user_id).first()
    if not pet:
        raise HTTPException(404, "Hayvan bulunamadı.")
    return pet

def _pet_out(p: Pet) -> dict:
    return {
        "id": p.id, "name": p.name, "species": p.species, "breed": p.breed,
        "gender": p.gender, "birth_date": p.birth_date, "weight": p.weight,
        "color": p.color, "notes": p.notes, "created_at": p.created_at,
    }
