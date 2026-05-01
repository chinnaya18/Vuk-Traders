from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from datetime import datetime
from num2words import num2words
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.schemas.invoice import InvoiceCreate, HsnSummary
from app.utils.qr_code import generate_qr_code


def generate_invoice_number(db: Session) -> str:
    """Generate the next invoice number in format INV-YYYYMM-XXXX."""
    now = datetime.now()
    prefix = f"INV-{now.strftime('%Y%m')}-"

    # Find the latest invoice number with this prefix
    latest = (
        db.query(Invoice)
        .filter(Invoice.invoice_no.like(f"{prefix}%"))
        .order_by(Invoice.invoice_no.desc())
        .first()
    )

    if latest:
        try:
            last_serial = int(latest.invoice_no.split("-")[-1])
            next_serial = last_serial + 1
        except (ValueError, IndexError):
            next_serial = 1
    else:
        next_serial = 1

    return f"{prefix}{next_serial:04d}"


def calculate_item_taxes(item_data: dict) -> dict:
    """Calculate tax amounts for a single item."""
    quantity = Decimal(str(item_data.get("quantity", 0)))
    rate = Decimal(str(item_data.get("rate", 0)))
    cgst_rate = Decimal(str(item_data.get("cgst_rate", "9.00")))
    sgst_rate = Decimal(str(item_data.get("sgst_rate", "9.00")))

    amount = quantity * rate
    cgst_amount = (amount * cgst_rate / Decimal("100")).quantize(Decimal("0.01"))
    sgst_amount = (amount * sgst_rate / Decimal("100")).quantize(Decimal("0.01"))
    total_with_tax = amount + cgst_amount + sgst_amount

    return {
        "amount": amount,
        "cgst_amount": cgst_amount,
        "sgst_amount": sgst_amount,
        "total_with_tax": total_with_tax,
    }


def amount_to_words(amount: Decimal) -> str:
    """Convert numeric amount to words (Indian style)."""
    try:
        rupees = int(amount)
        paise = int(round((amount - rupees) * 100))

        words = num2words(rupees, lang="en_IN").title()
        result = f"Rupees {words}"

        if paise > 0:
            paise_words = num2words(paise, lang="en_IN").title()
            result += f" and {paise_words} Paise"

        result += " Only"
        return result
    except Exception:
        return f"Rupees {amount} Only"


def create_invoice(db: Session, invoice_data: InvoiceCreate) -> Invoice:
    """Create a new invoice with items, calculating taxes and totals."""
    # Generate invoice number
    invoice_no = generate_invoice_number(db)

    # Calculate items
    subtotal = Decimal("0")
    total_cgst = Decimal("0")
    total_sgst = Decimal("0")

    items = []
    for item_data in invoice_data.items:
        item_dict = item_data.model_dump()
        taxes = calculate_item_taxes(item_dict)
        item_dict.update(taxes)

        subtotal += taxes["amount"]
        total_cgst += taxes["cgst_amount"]
        total_sgst += taxes["sgst_amount"]

        items.append(InvoiceItem(**item_dict))

    grand_total = subtotal + total_cgst + total_sgst
    words = amount_to_words(grand_total)

    # Generate QR code only if IRN is provided
    qr_code = ""
    if invoice_data.irn:
        qr_code = generate_qr_code(invoice_data.irn)

    # Create invoice
    invoice = Invoice(
        invoice_no=invoice_no,
        invoice_date=invoice_data.invoice_date,
        buyer_id=invoice_data.buyer_id,
        delivery_note=invoice_data.delivery_note,
        buyer_order_no=invoice_data.buyer_order_no,
        dispatch_doc_no=invoice_data.dispatch_doc_no,
        dispatched_through=invoice_data.dispatched_through,
        destination=invoice_data.destination,
        mode_terms_payment=invoice_data.mode_terms_payment,
        delivery_note_date=invoice_data.delivery_note_date,
        terms_of_delivery=invoice_data.terms_of_delivery,
        subtotal=subtotal,
        total_cgst=total_cgst,
        total_sgst=total_sgst,
        grand_total=grand_total,
        amount_in_words=words,
        declaration=invoice_data.declaration,
        irn=invoice_data.irn,
        ack_no=invoice_data.ack_no,
        ack_date=invoice_data.ack_date,
        qr_code_data=qr_code,
    )

    db.add(invoice)
    db.flush()  # Get invoice.id

    for item in items:
        item.invoice_id = invoice.id
        db.add(item)

    db.commit()
    db.refresh(invoice)
    return invoice


def get_hsn_summary(items) -> list:
    """Generate HSN/SAC-wise tax summary from invoice items."""
    hsn_map = {}
    for item in items:
        hsn = item.hsn_sac or "N/A"
        if hsn not in hsn_map:
            hsn_map[hsn] = {
                "hsn_sac": hsn,
                "total_quantity": Decimal("0"),
                "total_amount": Decimal("0"),
                "cgst_rate": item.cgst_rate,
                "cgst_amount": Decimal("0"),
                "sgst_rate": item.sgst_rate,
                "sgst_amount": Decimal("0"),
                "total_tax": Decimal("0"),
            }
        hsn_map[hsn]["total_quantity"] += item.quantity
        hsn_map[hsn]["total_amount"] += item.amount
        hsn_map[hsn]["cgst_amount"] += item.cgst_amount
        hsn_map[hsn]["sgst_amount"] += item.sgst_amount
        hsn_map[hsn]["total_tax"] += item.cgst_amount + item.sgst_amount

    return list(hsn_map.values())
