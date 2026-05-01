from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    address_line1 = Column(String(255), default="")
    address_line2 = Column(String(255), default="")
    address_line3 = Column(String(255), default="")
    city = Column(String(100), default="")
    pincode = Column(String(6), default="")
    state = Column(String(100), default="")
    state_code = Column(String(2), default="")
    gstin = Column(String(15), default="")
    gstins = Column(JSON, default=[])  # Multiple GSTINs
    email = Column(String(255), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
