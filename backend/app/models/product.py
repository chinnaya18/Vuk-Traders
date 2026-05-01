from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    hsn_sac = Column(String(20), nullable=False)
    rate = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
