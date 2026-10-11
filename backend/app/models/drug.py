from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Many-to-many ara tabloları
drug_species = Table(
    "drug_species",
    Base.metadata,
    Column("drug_id", Integer, ForeignKey("drugs.id"), primary_key=True),
    Column("species_id", Integer, ForeignKey("species.id"), primary_key=True),
)

drug_indications = Table(
    "drug_indications",
    Base.metadata,
    Column("drug_id", Integer, ForeignKey("drugs.id"), primary_key=True),
    Column("indication_id", Integer, ForeignKey("indications.id"), primary_key=True),
)

drug_therapeutic_group = Table(
    "drug_therapeutic_group",
    Base.metadata,
    Column("drug_id", Integer, ForeignKey("drugs.id"), primary_key=True),
    Column("therapeutic_group_id", Integer, ForeignKey("therapeutic_groups.id"), primary_key=True),
)


class Drug(Base):
    __tablename__ = "drugs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    turkish_name: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    trade_names: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON list as text
    pharmacological_class: Mapped[str | None] = mapped_column(String(150), nullable=True)
    side_effects: Mapped[str | None] = mapped_column(Text, nullable=True)
    contraindications: Mapped[str | None] = mapped_column(Text, nullable=True)
    interactions: Mapped[str | None] = mapped_column(Text, nullable=True)
    overdose_symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    warnings: Mapped[str | None] = mapped_column(Text, nullable=True)
    spc_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("sources.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    ingredients = relationship("DrugIngredient", back_populates="drug", cascade="all, delete-orphan")
    species = relationship("Species", secondary=drug_species, back_populates="drugs")
    indications = relationship("Indication", secondary=drug_indications, back_populates="drugs")
    source = relationship("Source", back_populates="drugs")
    favorites = relationship("Favorite", back_populates="drug", cascade="all, delete-orphan")
    therapeutic_groups = relationship(
        "TherapeuticGroup",
        secondary="drug_therapeutic_group",
        back_populates="drugs"
    )


class ActiveIngredient(Base):
    __tablename__ = "active_ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(500), unique=True, index=True)

    drug_ingredients = relationship("DrugIngredient", back_populates="ingredient")


class DrugIngredient(Base):
    __tablename__ = "drug_ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    drug_id: Mapped[int] = mapped_column(Integer, ForeignKey("drugs.id"))
    ingredient_id: Mapped[int] = mapped_column(Integer, ForeignKey("active_ingredients.id"))
    amount: Mapped[str | None] = mapped_column(String(100), nullable=True)  # "500 mg" gibi

    drug = relationship("Drug", back_populates="ingredients")
    ingredient = relationship("ActiveIngredient", back_populates="drug_ingredients")


class Species(Base):
    __tablename__ = "species"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)  # kedi, köpek, sığır
    turkish_name: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    drugs = relationship("Drug", secondary=drug_species, back_populates="species")


class Indication(Base):
    __tablename__ = "indications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)

    drugs = relationship("Drug", secondary=drug_indications, back_populates="indications")


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    document_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # SPC, prospektüs

    drugs = relationship("Drug", back_populates="source")


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    drug_id: Mapped[int] = mapped_column(Integer, ForeignKey("drugs.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="favorites")
    drug = relationship("Drug", back_populates="favorites")
