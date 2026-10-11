from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class UserAdminOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: str
    is_active: bool


class AuditLogOut(BaseModel):
    id: int
    user_id: int | None
    action: str
    entity_type: str | None
    entity_id: int | None
    old_value: str | None
    new_value: str | None
    ip_address: str | None
    created_at: datetime
    user_email: str | None = None
    model_config = {"from_attributes": True}


class ImportResult(BaseModel):
    total_rows: int
    inserted: int
    updated: int
    skipped: int
    errors: list[str]
