from __future__ import annotations
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.drug import Drug, ActiveIngredient, DrugIngredient, Species, Indication, Source
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.chatbot_log import ChatbotLog
from app.models.therapeutic_group import TherapeuticGroup
from app.schemas.drug import DrugCreate, DrugUpdate, DashboardStats


# ---------- Dashboard ----------

def get_dashboard_stats(db: Session) -> DashboardStats:
    return DashboardStats(
        total_drugs=db.query(func.count(Drug.id)).scalar(),
        total_ingredients=db.query(func.count(ActiveIngredient.id)).scalar(),
        total_species=db.query(func.count(Species.id)).scalar(),
        total_sources=db.query(func.count(Source.id)).scalar(),
        total_users=db.query(func.count(User.id)).scalar(),
        missing_spc=db.query(func.count(Drug.id)).filter(Drug.spc_url.is_(None)).scalar() or 0,
        missing_indications=db.query(Drug).filter(~Drug.indications.any()).count(),
    )


# ---------- Drug CRUD ----------

def list_drugs(db: Session, search: str = "", species_id: int = 0, indication_id: int = 0, page: int = 1, size: int = 20):
    q = db.query(Drug)
    if search:
        q = q.filter(Drug.name.ilike(f"%{search}%") | Drug.trade_names.ilike(f"%{search}%"))
    if species_id:
        q = q.filter(Drug.species.any(Species.id == species_id))
    if indication_id:
        q = q.filter(Drug.indications.any(Indication.id == indication_id))
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": items}


def get_drug(drug_id: int, db: Session) -> Drug:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="İlaç bulunamadı.")
    return drug


def create_drug(data: DrugCreate, db: Session) -> Drug:
    drug = Drug(
        name=data.name,
        trade_names=data.trade_names,
        pharmacological_class=data.pharmacological_class,
        side_effects=data.side_effects,
        contraindications=data.contraindications,
        interactions=data.interactions,
        overdose_symptoms=data.overdose_symptoms,
        warnings=data.warnings,
        spc_url=data.spc_url,
        source_id=data.source_id,
    )
    _set_relations(drug, data, db)
    db.add(drug)
    db.commit()
    db.refresh(drug)
    return drug


def update_drug(drug_id: int, data: DrugUpdate, db: Session) -> Drug:
    drug = get_drug(drug_id, db)
    for field in ["name", "trade_names", "pharmacological_class", "side_effects",
                  "contraindications", "interactions", "overdose_symptoms", "warnings", "spc_url", "source_id"]:
        setattr(drug, field, getattr(data, field))
    _set_relations(drug, data, db)
    db.commit()
    db.refresh(drug)
    return drug


def delete_drug(drug_id: int, db: Session):
    drug = get_drug(drug_id, db)
    db.delete(drug)
    db.commit()


def _set_relations(drug: Drug, data: DrugCreate, db: Session):
    drug.species = db.query(Species).filter(Species.id.in_(data.species_ids)).all()
    drug.indications = db.query(Indication).filter(Indication.id.in_(data.indication_ids)).all()
    # ingredients
    db.query(DrugIngredient).filter(DrugIngredient.drug_id == drug.id).delete()
    for item in data.ingredients:
        di = DrugIngredient(drug=drug, ingredient_id=item["ingredient_id"], amount=item.get("amount"))
        db.add(di)


def get_missing_drugs(db: Session):
    result = []
    drugs = db.query(Drug).all()
    for d in drugs:
        missing = []
        if not d.spc_url: missing.append("spc_url")
        if not d.indications: missing.append("indications")
        if not d.species: missing.append("species")
        if not d.side_effects: missing.append("side_effects")
        if missing:
            result.append({"id": d.id, "name": d.name, "missing_fields": missing})
    return result


# ---------- Species ----------

def list_species(db: Session): return db.query(Species).all()
def create_species(name: str, db: Session):
    if db.query(Species).filter(Species.name == name).first():
        raise HTTPException(400, "Bu tür zaten var.")
    s = Species(name=name); db.add(s); db.commit(); db.refresh(s); return s
def delete_species(sid: int, db: Session):
    s = db.query(Species).filter(Species.id == sid).first()
    if not s: raise HTTPException(404, "Bulunamadı.")
    db.delete(s); db.commit()


# ---------- Indications ----------

def list_indications(db: Session): return db.query(Indication).all()
def create_indication(name: str, db: Session):
    if db.query(Indication).filter(Indication.name == name).first():
        raise HTTPException(400, "Bu endikasyon zaten var.")
    i = Indication(name=name); db.add(i); db.commit(); db.refresh(i); return i
def delete_indication(iid: int, db: Session):
    i = db.query(Indication).filter(Indication.id == iid).first()
    if not i: raise HTTPException(404, "Bulunamadı.")
    db.delete(i); db.commit()


# ---------- Active Ingredients ----------

def list_ingredients(db: Session, search: str = ""):
    q = db.query(ActiveIngredient)
    if search: q = q.filter(ActiveIngredient.name.ilike(f"%{search}%"))
    return q.all()
def create_ingredient(name: str, db: Session):
    if db.query(ActiveIngredient).filter(ActiveIngredient.name == name).first():
        raise HTTPException(400, "Bu etken madde zaten var.")
    a = ActiveIngredient(name=name); db.add(a); db.commit(); db.refresh(a); return a
def delete_ingredient(aid: int, db: Session):
    a = db.query(ActiveIngredient).filter(ActiveIngredient.id == aid).first()
    if not a: raise HTTPException(404, "Bulunamadı.")
    db.delete(a); db.commit()


# ---------- Sources ----------

def list_sources(db: Session): return db.query(Source).all()
def create_source(name: str, url: str | None, doc_type: str | None, db: Session):
    s = Source(name=name, url=url, document_type=doc_type)
    db.add(s); db.commit(); db.refresh(s); return s
def delete_source(sid: int, db: Session):
    s = db.query(Source).filter(Source.id == sid).first()
    if not s: raise HTTPException(404, "Bulunamadı.")
    db.delete(s); db.commit()


# ---------- Users ----------

def list_users(db: Session): return db.query(User).all()
def update_user_role(uid: int, role: str, is_active: bool, db: Session):
    from app.models.user import UserRole
    u = db.query(User).filter(User.id == uid).first()
    if not u: raise HTTPException(404, "Kullanıcı bulunamadı.")
    u.role = UserRole(role); u.is_active = is_active
    db.commit(); db.refresh(u); return u


# ---------- Audit Logs ----------

def list_audit_logs(db: Session, page: int = 1, size: int = 50, action: str = ""):
    q = db.query(AuditLog)
    if action: q = q.filter(AuditLog.action == action)
    total = q.count()
    items = q.order_by(AuditLog.created_at.desc()).offset((page - 1) * size).limit(size).all()
    result = []
    for log in items:
        d = {
            "id": log.id, "user_id": log.user_id, "action": log.action,
            "entity_type": log.entity_type, "entity_id": log.entity_id,
            "old_value": log.old_value, "new_value": log.new_value,
            "ip_address": log.ip_address, "created_at": log.created_at,
            "user_email": log.user.email if log.user else None,
        }
        result.append(d)
    return {"total": total, "page": page, "size": size, "items": result}


# ---------- Chatbot Logs ----------

def list_chatbot_logs(db: Session, page: int = 1, size: int = 50, user_id: int = 0):
    q = db.query(ChatbotLog)
    if user_id:
        q = q.filter(ChatbotLog.user_id == user_id)
    total = q.count()
    items = q.order_by(ChatbotLog.created_at.desc()).offset((page - 1) * size).limit(size).all()
    result = []
    for log in items:
        d = {
            "id": log.id,
            "user_id": log.user_id,
            "user_email": log.user.email if log.user else "—",
            "question": log.question,
            "answer": log.answer[:200] if log.answer else "—",  # ilk 200 char
            "sources": log.sources,
            "created_at": log.created_at,
        }
        result.append(d)
    return {"total": total, "page": page, "size": size, "items": result}


# ---------- Therapeutic Groups ----------

def list_therapeutic_groups(db: Session):
    return db.query(TherapeuticGroup).order_by(TherapeuticGroup.name).all()

def get_therapeutic_group(tg_id: int, db: Session):
    tg = db.query(TherapeuticGroup).filter(TherapeuticGroup.id == tg_id).first()
    if not tg:
        raise HTTPException(404, "Terapötik grup bulunamadı.")
    return tg

def create_therapeutic_group(name: str, description: str | None, db: Session):
    if db.query(TherapeuticGroup).filter(TherapeuticGroup.name == name).first():
        raise HTTPException(400, "Bu terapötik grup zaten var.")
    tg = TherapeuticGroup(name=name, description=description)
    db.add(tg)
    db.commit()
    db.refresh(tg)
    return tg

def update_therapeutic_group(tg_id: int, name: str, description: str | None, db: Session):
    tg = get_therapeutic_group(tg_id, db)
    if name != tg.name and db.query(TherapeuticGroup).filter(TherapeuticGroup.name == name).first():
        raise HTTPException(400, "Bu isim zaten kullanılıyor.")
    tg.name = name
    tg.description = description
    db.commit()
    db.refresh(tg)
    return tg

def delete_therapeutic_group(tg_id: int, db: Session):
    tg = get_therapeutic_group(tg_id, db)
    db.delete(tg)
    db.commit()

def add_drug_to_therapeutic_group(tg_id: int, drug_id: int, db: Session):
    tg = get_therapeutic_group(tg_id, db)
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(404, "İlaç bulunamadı.")
    if drug not in tg.drugs:
        tg.drugs.append(drug)
        db.commit()
        db.refresh(tg)
    return tg

def remove_drug_from_therapeutic_group(tg_id: int, drug_id: int, db: Session):
    tg = get_therapeutic_group(tg_id, db)
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if drug and drug in tg.drugs:
        tg.drugs.remove(drug)
        db.commit()
        db.refresh(tg)
    return tg
