import qrcode
import io
import base64
import json


def generate_qr_code(data: dict) -> str:
    """
    Generate a QR code from invoice data and return as base64 PNG string.

    Args:
        data: Dictionary containing invoice information (invoice_no, gstin, total, date, etc.)

    Returns:
        Base64 encoded PNG image string
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(json.dumps(data, default=str))
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def get_qr_image_bytes(base64_str: str) -> bytes:
    """Convert base64 QR code string to bytes for PDF embedding."""
    return base64.b64decode(base64_str)
