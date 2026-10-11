from __future__ import annotations
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.models.drug import Drug, Species, Indication, Favorite, DrugIngredient


def search_drugs(db: Session, search: str, species_id: int, indication_id: int,
                 therapeutic_group: str, pharmaceutical_form: str, ingredient_id: int,
                 page: int, size: int, trade_names_only: bool = False):
    q = db.query(Drug)

    if search:
        if trade_names_only:
            # Yalnızca ticari isim (trade_names) ile ara
            q = q.filter(Drug.trade_names.ilike(f"%{search}%"))
        else:
            # İlaç adı, Türkçe adı, ticari isim ile ara
            q = q.filter(
                Drug.name.ilike(f"%{search}%") |
                Drug.turkish_name.ilike(f"%{search}%") |
                Drug.trade_names.ilike(f"%{search}%")
            )
    if species_id:
        q = q.filter(Drug.species.any(Species.id == species_id))
    if indication_id:
        q = q.filter(Drug.indications.any(Indication.id == indication_id))
    if therapeutic_group:
        q = q.filter(Drug.pharmacological_class.ilike(f"%{therapeutic_group}%"))
    if pharmaceutical_form:
        q = q.filter(Drug.warnings.ilike(f"%{pharmaceutical_form}%"))
    if ingredient_id:
        q = q.filter(Drug.ingredients.any(DrugIngredient.ingredient_id == ingredient_id))

    total = q.count()
    drugs = q.order_by(Drug.name).offset((page - 1) * size).limit(size).all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [_drug_card(d) for d in drugs],
    }


def get_drug_detail(drug_id: int, db: Session):
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(404, "İlaç bulunamadı.")
    return {
        "id": drug.id,
        "name": drug.name,
        "trade_names": drug.trade_names,
        "pharmacological_class": drug.pharmacological_class,
        "side_effects": drug.side_effects,
        "contraindications": drug.contraindications,
        "interactions": drug.interactions,
        "overdose_symptoms": drug.overdose_symptoms,
        "warnings": drug.warnings,
        "spc_url": drug.spc_url,
        "species": [{"id": s.id, "name": s.turkish_name or s.name} for s in drug.species],
        "indications": [{"id": i.id, "name": i.name} for i in drug.indications],
        "ingredients": [
            {"name": di.ingredient.name, "amount": di.amount}
            for di in drug.ingredients
        ],
        "source": {"name": drug.source.name, "url": drug.source.url} if drug.source else None,
    }


def _drug_card(drug: Drug) -> dict:
    return {
        "id": drug.id,
        "name": drug.name,
        "trade_names": drug.trade_names,
        "pharmacological_class": drug.pharmacological_class,
        "spc_url": drug.spc_url,
        "species": [s.turkish_name or s.name for s in drug.species],
        "indications": [i.name for i in drug.indications],
        "ingredients": [di.ingredient.name for di in drug.ingredients],
    }


def get_species(db: Session):
    return [{"id": s.id, "name": s.turkish_name or s.name} for s in db.query(Species).order_by(Species.name).all()]


def get_indications(db: Session):
    return [{"id": i.id, "name": i.name} for i in db.query(Indication).order_by(Indication.name).all()]


def get_therapeutic_groups(db: Session):
    rows = (db.query(distinct(Drug.pharmacological_class))
            .filter(Drug.pharmacological_class.isnot(None))
            .order_by(Drug.pharmacological_class).all())
    return [r[0] for r in rows if r[0]]


def get_pharmaceutical_forms(db: Session):
    # pharmaceutical_form bilgisi warnings alanında değil, trade_names içinde olabilir
    # VMD datasında pharmacological_class zaten therapeutic group'u tutuyor
    return get_therapeutic_groups(db)


# ── Favoriler ────────────────────────────────────────────
def get_favorites(user_id: int, db: Session):
    favs = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    return [_drug_card(f.drug) for f in favs]


def add_favorite(user_id: int, drug_id: int, db: Session):
    if db.query(Favorite).filter_by(user_id=user_id, drug_id=drug_id).first():
        raise HTTPException(400, "Zaten favorilerde.")
    db.add(Favorite(user_id=user_id, drug_id=drug_id))
    db.commit()
    return {"message": "Favorilere eklendi."}


def remove_favorite(user_id: int, drug_id: int, db: Session):
    fav = db.query(Favorite).filter_by(user_id=user_id, drug_id=drug_id).first()
    if fav:
        db.delete(fav)
        db.commit()
