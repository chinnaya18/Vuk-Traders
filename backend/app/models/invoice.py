from sqlalchemy import Column, Integer, String, Date, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(50), unique=True, nullable=False, index=True)
    invoice_date = Column(Date, nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)

    # Transport / dispatch details
    delivery_note = Column(String(255), default="")
    buyer_order_no = Column(String(100), default="")
    dispatch_doc_no = Column(String(100), default="")
    dispatched_through = Column(String(255), default="")
    destination = Column(String(255), default="")
    mode_terms_payment = Column(String(255), default="")
    delivery_note_date = Column(Date, nullable=True)
    terms_of_delivery = Column(Text, default="")

    # Totals
    subtotal = Column(Numeric(12, 2), default=0)
    total_cgst = Column(Numeric(12, 2), default=0)
    total_sgst = Column(Numeric(12, 2), default=0)
    grand_total = Column(Numeric(12, 2), default=0)
    amount_in_words = Column(String(500), default="")

    # Additional
    declaration = Column(Text, default="We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.")
    irn = Column(String(100), default="")
    ack_no = Column(String(100), default="")
    ack_date = Column(Date, nullable=True)
    qr_code_data = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer", backref="invoices", lazy="joined")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan", lazy="joined")
