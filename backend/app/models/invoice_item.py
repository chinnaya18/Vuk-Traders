from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    serial_no = Column(Integer, nullable=False)
    description = Column(String(500), nullable=False)
    hsn_sac = Column(String(20), default="")
    quantity = Column(Numeric(10, 2), default=0)
    unit = Column(String(10), default="PCS")
    rate = Column(Numeric(12, 2), default=0)
    amount = Column(Numeric(12, 2), default=0)

    # Tax per item
    cgst_rate = Column(Numeric(5, 2), default=9.00)
    cgst_amount = Column(Numeric(12, 2), default=0)
    sgst_rate = Column(Numeric(5, 2), default=9.00)
    sgst_amount = Column(Numeric(12, 2), default=0)
    total_with_tax = Column(Numeric(12, 2), default=0)

    # Relationship
    invoice = relationship("Invoice", back_populates="items")
