from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[str] = mapped_column(String(50))        # kedi / köpek / diğer
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="pets")
    visits = relationship("VetVisit", back_populates="pet", cascade="all, delete-orphan")
    medication_records = relationship("MedicationRecord", back_populates="pet", cascade="all, delete-orphan")
    schedules = relationship("MedicationSchedule", back_populates="pet", cascade="all, delete-orphan")


class VetVisit(Base):
    __tablename__ = "vet_visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pet_id: Mapped[int] = mapped_column(Integer, ForeignKey("pets.id"))
    visit_date: Mapped[str] = mapped_column(String(20))
    vet_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    clinic: Mapped[str | None] = mapped_column(String(150), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_visit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="visits")


class MedicationRecord(Base):
    __tablename__ = "medication_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pet_id: Mapped[int] = mapped_column(Integer, ForeignKey("pets.id"))
    drug_name: Mapped[str] = mapped_column(String(200))
    dose: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date: Mapped[str] = mapped_column(String(20))
    end_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    prescribed_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="medication_records")


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pet_id: Mapped[int] = mapped_column(Integer, ForeignKey("pets.id"))
    drug_name: Mapped[str] = mapped_column(String(200))
    dose: Mapped[str | None] = mapped_column(String(100), nullable=True)
    frequency: Mapped[str] = mapped_column(String(50))      # günlük / 2x / 3x / haftalık
    times: Mapped[str] = mapped_column(String(200))         # "08:00,20:00" gibi
    start_date: Mapped[str] = mapped_column(String(20))
    end_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="schedules")
