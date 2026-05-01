from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from app.utils.validators import validate_gstin, validate_pincode


class BuyerBase(BaseModel):
    company_name: str
    address_line1: str = ""
    address_line2: str = ""
    address_line3: str = ""
    city: str = ""
    pincode: str = ""
    state: str = ""
    state_code: str = ""
    gstin: str = ""
    gstins: List[str] = []  # Multiple GSTINs
    email: str = ""

    @field_validator("gstin")
    @classmethod
    def validate_gstin_format(cls, v):
        if v and not validate_gstin(v):
            raise ValueError("Invalid GSTIN format. Expected: 22AAAAA0000A1Z5")
        return v.upper() if v else v

    @field_validator("gstins")
    @classmethod
    def validate_gstins_format(cls, v):
        for gstin in v:
            if gstin and not validate_gstin(gstin):
                raise ValueError(f"Invalid GSTIN format: {gstin}. Expected: 22AAAAA0000A1Z5")
        return [gstin.upper() if gstin else gstin for gstin in v]

    @field_validator("pincode")
    @classmethod
    def validate_pincode_format(cls, v):
        if v and not validate_pincode(v):
            raise ValueError("Invalid pincode. Must be 6 digits.")
        return v


class BuyerCreate(BuyerBase):
    pass


class BuyerUpdate(BuyerBase):
    company_name: Optional[str] = None


class BuyerResponse(BuyerBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
