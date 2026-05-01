from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.owner import Owner
from app.schemas.owner import OwnerCreate, OwnerUpdate, OwnerResponse

router = APIRouter(prefix="/api/owner", tags=["Owner"])


@router.post("", response_model=OwnerResponse)
def register_owner(owner_data: OwnerCreate, db: Session = Depends(get_db)):
    """Register owner details (one-time setup)."""
    existing = db.query(Owner).first()
    if existing:
        raise HTTPException(status_code=400, detail="Owner already registered. Use PUT to update.")

    owner = Owner(**owner_data.model_dump())
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner


@router.get("", response_model=OwnerResponse)
def get_owner(db: Session = Depends(get_db)):
    """Get owner details."""
    owner = db.query(Owner).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not registered yet.")
    return owner


@router.put("", response_model=OwnerResponse)
def update_owner(owner_data: OwnerUpdate, db: Session = Depends(get_db)):
    """Update owner details."""
    owner = db.query(Owner).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not registered yet. Use POST first.")

    for key, value in owner_data.model_dump().items():
        setattr(owner, key, value)

    db.commit()
    db.refresh(owner)
    return owner
