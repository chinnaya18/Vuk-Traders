import re


GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

# Valid Indian state codes (01-37 plus some special codes)
VALID_STATE_CODES = {
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36", "37", "38",
    "97",  # Other territory
}


def validate_gstin(gstin: str) -> bool:
    """Validate GSTIN format (15-character alphanumeric)."""
    if not gstin:
        return True  # Allow empty GSTIN for some cases
    return bool(GSTIN_REGEX.match(gstin.upper()))


def validate_pincode(pincode: str) -> bool:
    """Validate Indian pincode (6 digits)."""
    if not pincode:
        return True
    return bool(re.match(r"^[1-9][0-9]{5}$", pincode))


def validate_ifsc(ifsc: str) -> bool:
    """Validate IFSC code format."""
    if not ifsc:
        return True
    return bool(re.match(r"^[A-Z]{4}0[A-Z0-9]{6}$", ifsc.upper()))
