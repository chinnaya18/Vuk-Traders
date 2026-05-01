import requests
import json
import base64

BASE_URL = "http://localhost:8000/api"

# 1. Create Owner
owner_data = {
    "company_name": "Vuk Traders (Dummy)",
    "address_line1": "123 Main Street",
    "address_line2": "Sector 4",
    "address_line3": "",
    "city": "Raipur",
    "pincode": "492001",
    "state": "Chhattisgarh",
    "state_code": "22",
    "gstin": "22AAAAA0000A1Z5",
    "email": "contact@vuktraders.com"
}
print("Creating Owner...")
requests.post(f"{BASE_URL}/owner", json=owner_data)

# 2. Create Bank Details
bank_data = {
    "bank_name": "State Bank of India",
    "account_no": "000000123456789",
    "branch": "Main Branch, Raipur",
    "ifsc_code": "SBIN0000123"
}
print("Creating Bank Details...")
requests.post(f"{BASE_URL}/bank-details", json=bank_data)

# 3. Create Buyer
buyer_data = {
    "company_name": "Acme Corp (Dummy Buyer)",
    "address_line1": "456 Tech Park",
    "city": "Bhilai",
    "pincode": "490020",
    "state": "Chhattisgarh",
    "state_code": "22",
    "gstin": "22BBBBB1111B1Z6",
    "email": "billing@acmecorp.com"
}
print("Creating Buyer...")
buyer_res = requests.post(f"{BASE_URL}/buyers", json=buyer_data)
buyer_id = buyer_res.json().get("id")

# 4. Get Next Invoice No
next_inv_res = requests.get(f"{BASE_URL}/invoices/next-number")
invoice_no = next_inv_res.json().get("next_invoice_no")

# 5. Create Invoice
invoice_data = {
    "invoice_no": invoice_no,
    "invoice_date": "2026-05-01",
    "buyer_id": buyer_id,
    "delivery_note": "DN-001",
    "buyer_order_no": "PO-999",
    "mode_terms_payment": "Net 30",
    "items": [
        {
            "serial_no": 1,
            "description": "Industrial Steel Pipes (1 inch)",
            "hsn_sac": "7306",
            "quantity": 150,
            "unit": "PCS",
            "rate": 450.00,
            "cgst_rate": 9.0,
            "sgst_rate": 9.0
        },
        {
            "serial_no": 2,
            "description": "Welding Electrodes Box",
            "hsn_sac": "8311",
            "quantity": 25,
            "unit": "BOX",
            "rate": 1200.00,
            "cgst_rate": 9.0,
            "sgst_rate": 9.0
        }
    ]
}
print("Creating Invoice...")
invoice_res = requests.post(f"{BASE_URL}/invoices", json=invoice_data)
invoice_id = invoice_res.json().get("id")
print(f"Created Invoice ID: {invoice_id}")

# 6. Test PDF Download
if invoice_id:
    print(f"Testing PDF generation for invoice {invoice_id}...")
    pdf_res = requests.get(f"{BASE_URL}/invoices/{invoice_id}/pdf")
    if pdf_res.status_code == 200:
        with open(f"dummy_invoice_{invoice_id}.pdf", "wb") as f:
            f.write(pdf_res.content)
        print(f"SUCCESS: PDF generated and saved as dummy_invoice_{invoice_id}.pdf")
    else:
        print(f"FAILED to generate PDF: {pdf_res.text}")
