from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, ForeignKey, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class TherapeuticGroup(Base):
    __tablename__ = "therapeutic_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    drugs: Mapped[list] = relationship(
        "Drug",
        secondary="drug_therapeutic_group",
        back_populates="therapeutic_groups"
    )


# Reexport association table
__all__ = ["TherapeuticGroup", "drug_therapeutic_group"]

