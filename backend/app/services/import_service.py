from __future__ import annotations
import io
import pandas as pd
from sqlalchemy.orm import Session

from app.models.drug import Drug, ActiveIngredient, DrugIngredient, Species, Indication, Source
from app.schemas.admin import ImportResult


def import_drugs_from_excel(content: bytes, db: Session) -> ImportResult:
    try:
        df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        return ImportResult(total_rows=0, inserted=0, updated=0, skipped=0, errors=[str(e)])

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    inserted = updated = skipped = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            name = str(row.get("ilac_adi") or row.get("name") or "").strip()
            if not name:
                skipped += 1
                continue

            drug = db.query(Drug).filter(Drug.name == name).first()
            is_new = drug is None
            if is_new:
                drug = Drug(name=name)
                db.add(drug)

            drug.trade_names = _val(row, "ticari_isimler", "trade_names")
            drug.pharmacological_class = _val(row, "farmakolojik_sinif", "pharmacological_class")
            drug.side_effects = _val(row, "yan_etkiler", "side_effects")
            drug.contraindications = _val(row, "kontrendikasyonlar", "contraindications")
            drug.interactions = _val(row, "etkilesimler", "interactions")
            drug.overdose_symptoms = _val(row, "doz_asimi_belirtileri", "overdose_symptoms")
            drug.warnings = _val(row, "dikkat_edilecekler", "warnings")
            drug.spc_url = _val(row, "spc_url", "source_url")

            # Tür
            species_raw = _val(row, "hedef_turler", "species")
            if species_raw:
                for s_name in [x.strip() for x in str(species_raw).split(",") if x.strip()]:
                    sp = db.query(Species).filter(Species.name == s_name).first()
                    if not sp:
                        sp = Species(name=s_name); db.add(sp); db.flush()
                    if sp not in drug.species:
                        drug.species.append(sp)

            # Endikasyon
            ind_raw = _val(row, "kullanim_amaci", "indications")
            if ind_raw:
                for i_name in [x.strip() for x in str(ind_raw).split(",") if x.strip()]:
                    ind = db.query(Indication).filter(Indication.name == i_name).first()
                    if not ind:
                        ind = Indication(name=i_name); db.add(ind); db.flush()
                    if ind not in drug.indications:
                        drug.indications.append(ind)

            # Etken madde
            ing_raw = _val(row, "etken_maddeler", "active_ingredients")
            if ing_raw:
                for part in [x.strip() for x in str(ing_raw).split(",") if x.strip()]:
                    pieces = part.split(":")
                    ing_name = pieces[0].strip()
                    amount = pieces[1].strip() if len(pieces) > 1 else None
                    ai = db.query(ActiveIngredient).filter(ActiveIngredient.name == ing_name).first()
                    if not ai:
                        ai = ActiveIngredient(name=ing_name); db.add(ai); db.flush()
                    exists = db.query(DrugIngredient).filter_by(drug=drug, ingredient=ai).first()
                    if not exists:
                        db.add(DrugIngredient(drug=drug, ingredient=ai, amount=amount))

            db.flush()
            inserted += 1 if is_new else 0
            updated += 0 if is_new else 1

        except Exception as e:
            errors.append(f"Satır {idx + 2}: {str(e)}")
            db.rollback()

    db.commit()
    return ImportResult(
        total_rows=len(df), inserted=inserted, updated=updated, skipped=skipped, errors=errors
    )


def _val(row, *keys) -> str | None:
    for k in keys:
        v = row.get(k)
        if v is not None and str(v).strip() not in ("", "nan", "None"):
            return str(v).strip()
    return None
