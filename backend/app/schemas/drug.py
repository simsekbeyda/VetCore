from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class SpeciesBase(BaseModel):
    name: str
    turkish_name: str | None = None

class SpeciesOut(SpeciesBase):
    id: int
    model_config = {"from_attributes": True}


class IndicationBase(BaseModel):
    name: str

class IndicationOut(IndicationBase):
    id: int
    model_config = {"from_attributes": True}


class ActiveIngredientBase(BaseModel):
    name: str

class ActiveIngredientOut(ActiveIngredientBase):
    id: int
    model_config = {"from_attributes": True}


class DrugIngredientOut(BaseModel):
    ingredient: ActiveIngredientOut
    amount: str | None
    model_config = {"from_attributes": True}


class SourceBase(BaseModel):
    name: str
    url: str | None = None
    document_type: str | None = None

class SourceOut(SourceBase):
    id: int
    model_config = {"from_attributes": True}


class DrugCreate(BaseModel):
    name: str
    trade_names: str | None = None
    pharmacological_class: str | None = None
    side_effects: str | None = None
    contraindications: str | None = None
    interactions: str | None = None
    overdose_symptoms: str | None = None
    warnings: str | None = None
    spc_url: str | None = None
    source_id: int | None = None
    species_ids: list[int] = []
    indication_ids: list[int] = []
    ingredients: list[dict] = []  # [{"ingredient_id": 1, "amount": "500mg"}]

class DrugUpdate(DrugCreate):
    pass

class DrugListOut(BaseModel):
    id: int
    name: str
    turkish_name: str | None = None
    trade_names: str | None
    pharmacological_class: str | None
    spc_url: str | None
    species: list[SpeciesOut]
    indications: list[IndicationOut]
    model_config = {"from_attributes": True}

class DrugDetailOut(DrugListOut):
    side_effects: str | None
    contraindications: str | None
    interactions: str | None
    overdose_symptoms: str | None
    warnings: str | None
    source: SourceOut | None
    ingredients: list[DrugIngredientOut]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_drugs: int
    total_ingredients: int
    total_species: int
    total_sources: int
    total_users: int
    missing_spc: int
    missing_indications: int
