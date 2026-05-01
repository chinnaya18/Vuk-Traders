from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal


class InvoiceItemCreate(BaseModel):
    serial_no: int
    description: str
    hsn_sac: str = ""
    quantity: Decimal = Decimal("0")
    unit: str = "PCS"
    rate: Decimal = Decimal("0")
    cgst_rate: Decimal = Decimal("9.00")
    sgst_rate: Decimal = Decimal("9.00")


class InvoiceItemResponse(BaseModel):
    id: int
    serial_no: int
    description: str
    hsn_sac: str
    quantity: Decimal
    unit: str
    rate: Decimal
    amount: Decimal
    cgst_rate: Decimal
    cgst_amount: Decimal
    sgst_rate: Decimal
    sgst_amount: Decimal
    total_with_tax: Decimal

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    invoice_date: date
    buyer_id: int
    delivery_note: str = ""
    buyer_order_no: str = ""
    dispatch_doc_no: str = ""
    dispatched_through: str = ""
    destination: str = ""
    mode_terms_payment: str = ""
    delivery_note_date: Optional[date] = None
    terms_of_delivery: str = ""
    declaration: str = "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
    irn: str = ""
    ack_no: str = ""
    ack_date: Optional[date] = None
    items: List[InvoiceItemCreate]


class HsnSummary(BaseModel):
    hsn_sac: str
    total_quantity: Decimal
    total_amount: Decimal
    cgst_rate: Decimal
    cgst_amount: Decimal
    sgst_rate: Decimal
    sgst_amount: Decimal
    total_tax: Decimal


class InvoiceResponse(BaseModel):
    id: int
    invoice_no: str
    invoice_date: date
    buyer_id: int
    delivery_note: str
    buyer_order_no: str
    dispatch_doc_no: str
    dispatched_through: str
    destination: str
    mode_terms_payment: str
    delivery_note_date: Optional[date] = None
    terms_of_delivery: str
    subtotal: Decimal
    total_cgst: Decimal
    total_sgst: Decimal
    grand_total: Decimal
    amount_in_words: str
    declaration: str
    irn: str
    ack_no: str
    ack_date: Optional[date] = None
    qr_code_data: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[InvoiceItemResponse] = []
    buyer: Optional[dict] = None

    class Config:
        from_attributes = True


class InvoiceListResponse(BaseModel):
    id: int
    invoice_no: str
    invoice_date: date
    buyer_name: str
    grand_total: Decimal
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
