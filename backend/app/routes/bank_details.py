from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.bank_details import BankDetails
from app.schemas.bank_details import BankDetailsCreate, BankDetailsUpdate, BankDetailsResponse

router = APIRouter(prefix="/api/bank-details", tags=["Bank Details"])


@router.post("", response_model=BankDetailsResponse)
def save_bank_details(data: BankDetailsCreate, db: Session = Depends(get_db)):
    """Save bank details (one-time setup, or update if exists)."""
    existing = db.query(BankDetails).first()
    if existing:
        # Update existing
        for key, value in data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing

    bank = BankDetails(**data.model_dump())
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank


@router.get("", response_model=BankDetailsResponse)
def get_bank_details(db: Session = Depends(get_db)):
    """Get bank details."""
    bank = db.query(BankDetails).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank details not configured yet.")
    return bank


@router.put("", response_model=BankDetailsResponse)
def update_bank_details(data: BankDetailsUpdate, db: Session = Depends(get_db)):
    """Update bank details."""
    bank = db.query(BankDetails).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank details not configured. Use POST first.")

    for key, value in data.model_dump().items():
        setattr(bank, key, value)

    db.commit()
    db.refresh(bank)
    return bank
