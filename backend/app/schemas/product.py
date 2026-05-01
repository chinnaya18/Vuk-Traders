from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    hsn_sac: str
    rate: float

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Product name is required")
        return v.strip()

    @field_validator("hsn_sac")
    @classmethod
    def hsn_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("HSN/SAC code is required")
        return v.strip().upper()

    @field_validator("rate")
    @classmethod
    def rate_positive(cls, v):
        if v < 0:
            raise ValueError("Rate must be positive")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    hsn_sac: Optional[str] = None
    rate: Optional[float] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    hsn_sac: str
    rate: float
    created_at: datetime

    class Config:
        from_attributes = True
