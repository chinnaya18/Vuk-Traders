from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.utils.validators import validate_ifsc


class BankDetailsBase(BaseModel):
    bank_name: str = ""
    account_no: str = ""
    branch: str = ""
    ifsc_code: str = ""

    @field_validator("ifsc_code")
    @classmethod
    def validate_ifsc_format(cls, v):
        if v and not validate_ifsc(v):
            raise ValueError("Invalid IFSC code format.")
        return v.upper() if v else v


class BankDetailsCreate(BankDetailsBase):
    pass


class BankDetailsUpdate(BankDetailsBase):
    pass


class BankDetailsResponse(BankDetailsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
