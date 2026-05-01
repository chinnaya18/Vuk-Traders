import io
import base64
from decimal import Decimal
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Line

from app.services.invoice_service import get_hsn_summary


def _build_qr_image(qr_base64: str, width=30*mm, height=30*mm):
    """Create a ReportLab Image from a base64 QR code."""
    if not qr_base64:
        return ""
    img_data = base64.b64decode(qr_base64)
    img_buffer = io.BytesIO(img_data)
    img = Image(img_buffer, width=width, height=height)
    return img


def generate_invoice_pdf(invoice, owner, bank_details) -> bytes:
    """
    Generate a GST-format invoice PDF.

    Args:
        invoice: Invoice ORM object with items and buyer loaded
        owner: Owner ORM object
        bank_details: BankDetails ORM object (can be None)

    Returns:
        PDF file as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    style_title = ParagraphStyle(
        "InvoiceTitle", parent=styles["Heading1"],
        fontSize=14, alignment=TA_CENTER, spaceAfter=2,
        fontName="Helvetica-Bold", textColor=colors.HexColor("#1a1a2e")
    )
    style_subtitle = ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=8, alignment=TA_CENTER, spaceAfter=1,
        textColor=colors.HexColor("#444444")
    )
    style_normal = ParagraphStyle(
        "NormalSmall", parent=styles["Normal"],
        fontSize=8, leading=10
    )
    style_bold = ParagraphStyle(
        "BoldSmall", parent=styles["Normal"],
        fontSize=8, leading=10, fontName="Helvetica-Bold"
    )
    style_right = ParagraphStyle(
        "RightSmall", parent=styles["Normal"],
        fontSize=8, leading=10, alignment=TA_RIGHT
    )
    style_center = ParagraphStyle(
        "CenterSmall", parent=styles["Normal"],
        fontSize=8, leading=10, alignment=TA_CENTER
    )
    style_heading = ParagraphStyle(
        "TableHeading", parent=styles["Normal"],
        fontSize=7, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=9
    )
    style_cell = ParagraphStyle(
        "TableCell", parent=styles["Normal"],
        fontSize=7, leading=9
    )
    style_cell_right = ParagraphStyle(
        "TableCellRight", parent=styles["Normal"],
        fontSize=7, leading=9, alignment=TA_RIGHT
    )
    style_cell_center = ParagraphStyle(
        "TableCellCenter", parent=styles["Normal"],
        fontSize=7, leading=9, alignment=TA_CENTER
    )

    elements = []
    page_width = A4[0] - 30*mm  # available width

    # =========================================================================
    # HEADER: IRN/Ack on left, QR on right
    # =========================================================================
    irn_text = ""
    if invoice.irn:
        irn_text += f"<b>IRN:</b> {invoice.irn}<br/>"
    if invoice.ack_no:
        irn_text += f"<b>Ack No:</b> {invoice.ack_no}<br/>"
    if invoice.ack_date:
        irn_text += f"<b>Ack Date:</b> {invoice.ack_date}<br/>"

    qr_img = _build_qr_image(invoice.qr_code_data) if invoice.qr_code_data else ""

    if irn_text or qr_img:
        header_data = [[
            Paragraph(irn_text, style_normal) if irn_text else "",
            qr_img if qr_img else ""
        ]]
        header_table = Table(header_data, colWidths=[page_width - 35*mm, 35*mm])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elements.append(header_table)

    # =========================================================================
    # TITLE: Tax Invoice
    # =========================================================================
    elements.append(Paragraph("Tax Invoice", style_title))

    # =========================================================================
    # OWNER / SELLER DETAILS + INVOICE DETAILS
    # =========================================================================
    owner_addr = f"{owner.company_name}"
    if owner.address_line1:
        owner_addr += f"<br/>{owner.address_line1}"
    if owner.address_line2:
        owner_addr += f", {owner.address_line2}"
    if owner.address_line3:
        owner_addr += f", {owner.address_line3}"
    if owner.city:
        owner_addr += f"<br/>{owner.city}"
    if owner.pincode:
        owner_addr += f" - {owner.pincode}"
    if owner.state:
        owner_addr += f"<br/>{owner.state}"
    if owner.state_code:
        owner_addr += f" (Code: {owner.state_code})"
    if owner.gstin:
        owner_addr += f"<br/><b>GSTIN/UIN:</b> {owner.gstin}"
    if owner.email:
        owner_addr += f"<br/><b>Email:</b> {owner.email}"

    inv_details = f"""
    <b>Invoice No:</b> {invoice.invoice_no}<br/>
    <b>Invoice Date:</b> {invoice.invoice_date}<br/>
    <b>Delivery Note:</b> {invoice.delivery_note or '-'}<br/>
    <b>Mode/Terms:</b> {invoice.mode_terms_payment or '-'}<br/>
    """
    inv_details_2 = f"""
    <b>Buyer Order No:</b> {invoice.buyer_order_no or '-'}<br/>
    <b>Dispatch Doc No:</b> {invoice.dispatch_doc_no or '-'}<br/>
    <b>Dispatched Through:</b> {invoice.dispatched_through or '-'}<br/>
    <b>Destination:</b> {invoice.destination or '-'}<br/>
    """
    if invoice.delivery_note_date:
        inv_details_2 += f"<b>Del. Note Date:</b> {invoice.delivery_note_date}<br/>"

    seller_inv_data = [
        [
            Paragraph(f"<b>Seller:</b><br/>{owner_addr}", style_normal),
            Paragraph(inv_details, style_normal),
        ],
        [
            "",
            Paragraph(inv_details_2, style_normal),
        ]
    ]

    seller_inv_table = Table(seller_inv_data, colWidths=[page_width * 0.5, page_width * 0.5])
    seller_inv_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("SPAN", (0, 0), (0, 1)),
    ]))
    elements.append(seller_inv_table)

    # =========================================================================
    # BUYER DETAILS
    # =========================================================================
    buyer = invoice.buyer
    buyer_addr = f"<b>{buyer.company_name}</b>"
    if buyer.address_line1:
        buyer_addr += f"<br/>{buyer.address_line1}"
    if buyer.address_line2:
        buyer_addr += f", {buyer.address_line2}"
    if buyer.address_line3:
        buyer_addr += f", {buyer.address_line3}"
    if buyer.city:
        buyer_addr += f"<br/>{buyer.city}"
    if buyer.pincode:
        buyer_addr += f" - {buyer.pincode}"
    if buyer.state:
        buyer_addr += f"<br/>{buyer.state}"
    if buyer.state_code:
        buyer_addr += f" (Code: {buyer.state_code})"
    if buyer.gstin:
        buyer_addr += f"<br/><b>GSTIN/UIN:</b> {buyer.gstin}"

    buyer_data = [[
        Paragraph(f"<b>Buyer (Bill to):</b><br/>{buyer_addr}", style_normal),
        Paragraph(f"<b>Terms of Delivery:</b><br/>{invoice.terms_of_delivery or '-'}", style_normal),
    ]]

    buyer_table = Table(buyer_data, colWidths=[page_width * 0.5, page_width * 0.5])
    buyer_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(buyer_table)

    # =========================================================================
    # ITEMS TABLE
    # =========================================================================
    col_widths = [
        20*mm,   # S.No
        page_width - 20*mm - 22*mm - 18*mm - 18*mm - 22*mm - 22*mm - 22*mm - 22*mm,  # Description
        22*mm,   # HSN/SAC
        18*mm,   # Qty
        18*mm,   # Unit
        22*mm,   # Rate
        22*mm,   # CGST
        22*mm,   # SGST
        22*mm,   # Amount
    ]

    # Header row
    item_header = [
        Paragraph("Sl No.", style_heading),
        Paragraph("Description of Goods", style_heading),
        Paragraph("HSN/SAC", style_heading),
        Paragraph("Qty", style_heading),
        Paragraph("Unit", style_heading),
        Paragraph("Rate", style_heading),
        Paragraph(f"CGST<br/>@%", style_heading),
        Paragraph(f"SGST<br/>@%", style_heading),
        Paragraph("Amount", style_heading),
    ]

    item_rows = [item_header]

    for item in invoice.items:
        cgst_text = f"{item.cgst_rate}%<br/>₹{item.cgst_amount:,.2f}"
        sgst_text = f"{item.sgst_rate}%<br/>₹{item.sgst_amount:,.2f}"
        row = [
            Paragraph(str(item.serial_no), style_cell_center),
            Paragraph(str(item.description), style_cell),
            Paragraph(str(item.hsn_sac), style_cell_center),
            Paragraph(f"{item.quantity:,.2f}", style_cell_right),
            Paragraph(str(item.unit), style_cell_center),
            Paragraph(f"₹{item.rate:,.2f}", style_cell_right),
            Paragraph(cgst_text, style_cell_center),
            Paragraph(sgst_text, style_cell_center),
            Paragraph(f"₹{item.amount:,.2f}", style_cell_right),
        ]
        item_rows.append(row)

    # Totals row
    totals_row = [
        "", "",
        Paragraph("<b>Total</b>", style_cell_right),
        "", "", "",
        Paragraph(f"<b>₹{invoice.total_cgst:,.2f}</b>", style_cell_right),
        Paragraph(f"<b>₹{invoice.total_sgst:,.2f}</b>", style_cell_right),
        Paragraph(f"<b>₹{invoice.subtotal:,.2f}</b>", style_cell_right),
    ]
    item_rows.append(totals_row)

    items_table = Table(item_rows, colWidths=col_widths, repeatRows=1)
    items_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eaf6")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        # Bold the totals row
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f5f5f5")),
    ]))
    elements.append(items_table)

    # =========================================================================
    # GRAND TOTAL SUMMARY
    # =========================================================================
    summary_data = [
        [Paragraph("<b>Subtotal (before tax):</b>", style_normal),
         Paragraph(f"<b>₹{invoice.subtotal:,.2f}</b>", style_right)],
        [Paragraph(f"<b>CGST Total:</b>", style_normal),
         Paragraph(f"₹{invoice.total_cgst:,.2f}", style_right)],
        [Paragraph(f"<b>SGST Total:</b>", style_normal),
         Paragraph(f"₹{invoice.total_sgst:,.2f}", style_right)],
        [Paragraph(f"<b>Grand Total:</b>", style_normal),
         Paragraph(f"<b>₹{invoice.grand_total:,.2f}</b>", style_right)],
    ]
    summary_table = Table(summary_data, colWidths=[page_width * 0.6, page_width * 0.4])
    summary_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e8eaf6")),
    ]))
    elements.append(summary_table)

    # Amount in words
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(f"<b>Amount (in words):</b> {invoice.amount_in_words}", style_normal))
    elements.append(Spacer(1, 3*mm))

    # =========================================================================
    # HSN/SAC SUMMARY TABLE
    # =========================================================================
    hsn_items = get_hsn_summary(invoice.items)
    if hsn_items:
        hsn_header = [
            Paragraph("<b>HSN/SAC</b>", style_heading),
            Paragraph("<b>Total Qty</b>", style_heading),
            Paragraph("<b>Taxable Value</b>", style_heading),
            Paragraph("<b>CGST Rate</b>", style_heading),
            Paragraph("<b>CGST Amt</b>", style_heading),
            Paragraph("<b>SGST Rate</b>", style_heading),
            Paragraph("<b>SGST Amt</b>", style_heading),
            Paragraph("<b>Total Tax</b>", style_heading),
        ]
        hsn_rows = [hsn_header]
        for h in hsn_items:
            hsn_rows.append([
                Paragraph(str(h["hsn_sac"]), style_cell_center),
                Paragraph(f"{h['total_quantity']:,.2f}", style_cell_right),
                Paragraph(f"₹{h['total_amount']:,.2f}", style_cell_right),
                Paragraph(f"{h['cgst_rate']}%", style_cell_center),
                Paragraph(f"₹{h['cgst_amount']:,.2f}", style_cell_right),
                Paragraph(f"{h['sgst_rate']}%", style_cell_center),
                Paragraph(f"₹{h['sgst_amount']:,.2f}", style_cell_right),
                Paragraph(f"₹{h['total_tax']:,.2f}", style_cell_right),
            ])

        hsn_col_w = page_width / 8
        hsn_table = Table(hsn_rows, colWidths=[hsn_col_w]*8, repeatRows=1)
        hsn_table.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eaf6")),
            ("FONTSIZE", (0, 0), (-1, -1), 7),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))

        elements.append(Paragraph("<b>HSN/SAC Summary</b>", style_bold))
        elements.append(Spacer(1, 2*mm))
        elements.append(hsn_table)
        elements.append(Spacer(1, 3*mm))

    # =========================================================================
    # BANK DETAILS + DECLARATION + SIGNATURE
    # =========================================================================
    bank_text = ""
    if bank_details:
        bank_text = f"""
        <b>Company's Bank Details:</b><br/>
        Bank Name: {bank_details.bank_name}<br/>
        A/c No.: {bank_details.account_no}<br/>
        Branch: {bank_details.branch}<br/>
        IFSC Code: {bank_details.ifsc_code}
        """
    else:
        bank_text = "<b>Company's Bank Details:</b><br/>Not configured"

    declaration_text = f"""
    <b>Declaration:</b><br/>
    {invoice.declaration}
    """

    company_sig = f"""
    <br/><br/><br/>
    <b>for {owner.company_name}</b><br/><br/>
    Authorised Signatory
    """

    footer_data = [
        [
            Paragraph(bank_text, style_normal),
            "",
        ],
        [
            Paragraph(declaration_text, style_normal),
            Paragraph(company_sig, style_right),
        ],
    ]

    footer_table = Table(footer_data, colWidths=[page_width * 0.6, page_width * 0.4])
    footer_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("VALIGN", (1, 1), (1, 1), "BOTTOM"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(footer_table)

    # =========================================================================
    # Computer generated text
    # =========================================================================
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(
        "This is a computer generated invoice.",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=7, alignment=TA_CENTER, textColor=colors.grey)
    ))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
