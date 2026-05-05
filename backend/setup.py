#!/usr/bin/env python
"""
Setup script to initialize dependencies and database for the Vuk Traders backend.
"""
import subprocess
import sys
import os
from pathlib import Path

REQUIREMENTS_FILE = Path(__file__).parent / 'requirements.txt'

def check_and_install_dependencies():
    """Check if dependencies are installed, if not, install them."""
    print("\n" + "="*60)
    print("Vuk Traders Backend Setup")
    print("="*60)
    print(f"Python: {sys.executable}")
    print(f"Version: {sys.version.split()[0]}")
    print("="*60 + "\n")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'pydantic_settings',
        'alembic',
        'reportlab',
        'qrcode',
        'num2words',
    ]
    
    missing_packages = []
    print("Checking dependencies...\n")
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠  Installing {len(missing_packages)} missing package(s)...\n")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', 
                '-r', str(REQUIREMENTS_FILE),
                '--disable-pip-version-check'
            ])
            print("\n✓ Dependencies installed successfully!")
            return True
        except subprocess.CalledProcessError as e:
            print(f"\n✗ Failed to install: {e}")
            return False
    else:
        print("\n✓ All dependencies found!")
        return True

def init_database():
    """Initialize the database."""
    try:
        from app.database import engine, Base
        from app.models import Owner, Buyer, Invoice, InvoiceItem, BankDetails, Product
        
        print("\nInitializing database...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database ready!")
        return True
    except Exception as e:
        print(f"⚠  Database init skipped: {str(e)[:80]}")
        return True

if __name__ == '__main__':
    try:
        print("\n")
        success = check_and_install_dependencies()
        
        if success:
            init_database()
        
        print("\n" + "="*60)
        print("✓ Backend setup complete!")
        print("="*60 + "\n")
        
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
