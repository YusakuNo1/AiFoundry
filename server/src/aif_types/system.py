from typing import List
from sqlmodel import Field, SQLModel, JSON, Column
from enum import Enum


class LmProviderStatus(SQLModel):
    id: str = Field(primary_key=True)
    name: str
    status: str     # available or unavailable


class GetSystemConfigResponse(SQLModel):
    lmProviderStatus: dict[str, LmProviderStatus]
