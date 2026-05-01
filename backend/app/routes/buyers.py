from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.buyer import Buyer
from app.schemas.buyer import BuyerCreate, BuyerUpdate, BuyerResponse

router = APIRouter(prefix="/api/buyers", tags=["Buyers"])


@router.post("", response_model=BuyerResponse)
def create_buyer(buyer_data: BuyerCreate, db: Session = Depends(get_db)):
    """Add a new buyer."""
    buyer = Buyer(**buyer_data.model_dump())
    db.add(buyer)
    db.commit()
    db.refresh(buyer)
    return buyer


@router.get("", response_model=List[BuyerResponse])
def list_buyers(db: Session = Depends(get_db)):
    """List all buyers."""
    return db.query(Buyer).order_by(Buyer.company_name).all()


@router.get("/{buyer_id}", response_model=BuyerResponse)
def get_buyer(buyer_id: int, db: Session = Depends(get_db)):
    """Get a buyer by ID."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.put("/{buyer_id}", response_model=BuyerResponse)
def update_buyer(buyer_id: int, buyer_data: BuyerUpdate, db: Session = Depends(get_db)):
    """Update a buyer."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    update_data = buyer_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(buyer, key, value)

    db.commit()
    db.refresh(buyer)
    return buyer


@router.delete("/{buyer_id}")
def delete_buyer(buyer_id: int, db: Session = Depends(get_db)):
    """Delete a buyer."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    db.delete(buyer)
    db.commit()
    return {"message": "Buyer deleted successfully"}
