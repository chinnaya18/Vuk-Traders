from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.database import get_db
from app.models.invoice import Invoice
from app.models.owner import Owner
from app.models.bank_details import BankDetails
from app.schemas.invoice import InvoiceCreate, InvoiceResponse, InvoiceListResponse
from app.services.invoice_service import create_invoice, generate_invoice_number, get_hsn_summary
from app.services.pdf_generator import generate_invoice_pdf

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("/next-number")
def get_next_invoice_number(db: Session = Depends(get_db)):
    """Get the next auto-generated invoice number."""
    return {"invoice_no": generate_invoice_number(db)}


@router.post("", response_model=InvoiceResponse)
def create_new_invoice(invoice_data: InvoiceCreate, db: Session = Depends(get_db)):
    """Create a new invoice with items."""
    if not invoice_data.items:
        raise HTTPException(status_code=400, detail="Invoice must have at least one item.")

    try:
        invoice = create_invoice(db, invoice_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")

    return _invoice_to_response(invoice)


@router.get("", response_model=List[InvoiceListResponse])
def list_invoices(db: Session = Depends(get_db)):
    """List all invoices."""
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    result = []
    for inv in invoices:
        result.append(InvoiceListResponse(
            id=inv.id,
            invoice_no=inv.invoice_no,
            invoice_date=inv.invoice_date,
            buyer_name=inv.buyer.company_name if inv.buyer else "N/A",
            grand_total=inv.grand_total,
            created_at=inv.created_at,
        ))
    return result


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """Get invoice details by ID."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _invoice_to_response(invoice)


@router.get("/{invoice_id}/hsn-summary")
def get_invoice_hsn_summary(invoice_id: int, db: Session = Depends(get_db)):
    """Get HSN/SAC-wise tax summary for an invoice."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return get_hsn_summary(invoice.items)


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(invoice_id: int, db: Session = Depends(get_db)):
    """Generate and download invoice PDF."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    owner = db.query(Owner).first()
    if not owner:
        raise HTTPException(status_code=400, detail="Owner not registered. Please set up owner details first.")

    bank = db.query(BankDetails).first()

    pdf_bytes = generate_invoice_pdf(invoice, owner, bank)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Invoice_{invoice.invoice_no}.pdf"'
        }
    )


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """Delete an invoice and its items."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}


def _invoice_to_response(invoice: Invoice) -> InvoiceResponse:
    """Convert Invoice ORM to response schema."""
    buyer_dict = None
    if invoice.buyer:
        buyer_dict = {
            "id": invoice.buyer.id,
            "company_name": invoice.buyer.company_name,
            "address_line1": invoice.buyer.address_line1,
            "address_line2": invoice.buyer.address_line2,
            "address_line3": invoice.buyer.address_line3,
            "city": invoice.buyer.city,
            "pincode": invoice.buyer.pincode,
            "state": invoice.buyer.state,
            "state_code": invoice.buyer.state_code,
            "gstin": invoice.buyer.gstin,
            "email": invoice.buyer.email,
        }

    return InvoiceResponse(
        id=invoice.id,
        invoice_no=invoice.invoice_no,
        invoice_date=invoice.invoice_date,
        buyer_id=invoice.buyer_id,
        delivery_note=invoice.delivery_note,
        buyer_order_no=invoice.buyer_order_no,
        dispatch_doc_no=invoice.dispatch_doc_no,
        dispatched_through=invoice.dispatched_through,
        destination=invoice.destination,
        mode_terms_payment=invoice.mode_terms_payment,
        delivery_note_date=invoice.delivery_note_date,
        terms_of_delivery=invoice.terms_of_delivery,
        subtotal=invoice.subtotal,
        total_cgst=invoice.total_cgst,
        total_sgst=invoice.total_sgst,
        grand_total=invoice.grand_total,
        amount_in_words=invoice.amount_in_words,
        declaration=invoice.declaration,
        irn=invoice.irn,
        ack_no=invoice.ack_no,
        ack_date=invoice.ack_date,
        qr_code_data=invoice.qr_code_data,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        items=invoice.items,
        buyer=buyer_dict,
    )
