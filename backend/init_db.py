#!/usr/bin/env python3
"""
Initialize SQLite database and create all tables
"""
import os
from app.database import Base, engine
from app.models.owner import Owner
from app.models.product import Product
from app.models.buyer import Buyer
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.bank_details import BankDetails


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
