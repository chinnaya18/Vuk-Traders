# Vuk Traders - Quick Start Guide

## What is This?

This is a **Vuk Traders GST Invoice System** - a standalone desktop application for:
- Managing buyers and products
- Creating GST invoices with QR codes
- Generating PDF invoices
- Managing bank and owner details

## 30-Second Quick Start

### Prerequisites Check
- ✅ Windows 10/11 64-bit
- ✅ PostgreSQL installed on your computer
- ✅ 200 MB free disk space

### Installation
1. Run: `Vuk Traders GST Invoice System-1.0.0.exe`
2. Click "Install"
3. Wait for completion (takes ~2-3 minutes)
4. App launches automatically

### First-Time Database Setup
1. When the app starts, it will check for PostgreSQL
2. If not found, you'll see an error - install PostgreSQL first (see Deployment Guide)
3. Configure `.env` file with your database credentials (see instructions below)

### Create Your First Invoice
1. Click **"Owner"** - add your business details
2. Click **"Bank Details"** - add your bank info
3. Click **"Products"** - add what you sell
4. Click **"Buyers"** - add your clients
5. Click **"Invoices"** - create your first invoice
6. Click **"View/Download"** - generate PDF

## Database Setup (IMPORTANT!)

### Step 1: Install PostgreSQL
- Download from: https://www.postgresql.org/download/windows/
- During installation, remember your superuser password
- Default port: 5432

### Step 2: Create Database

**Option A: Using Command Line (PowerShell)**
```powershell
# Run as Administrator
psql -U postgres

# Then type these commands:
CREATE DATABASE vuk_traders;
CREATE USER vuk_trader WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE vuk_traders TO vuk_trader;
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin from Start Menu
2. Right-click Databases → Create → Database
3. Name: `vuk_traders`
4. Right-click Login/Group Roles → Create → Login/Group Role
5. Name: `vuk_trader`
6. Password: `password123` (or your choice)
7. In Privileges tab: grant all privileges to `vuk_traders` database

### Step 3: Configure Environment

Find the `.env` file in the app installation directory:
- Usually: `C:\Program Files\Vuk Traders GST Invoice System\backend\.env`

Update these values:
```
DATABASE_URL=postgresql+psycopg://vuk_trader:password123@localhost:5432/vuk_traders
APP_NAME=Vuk Traders GST Invoice System
DEBUG=false
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check PostgreSQL is running & database exists |
| App won't start | Restart PostgreSQL service from Services.msc |
| "Port 8000 already in use" | Close other apps or change port in .env |
| Forgot database password | Reset it in pgAdmin or psql |

## Feature Checklist

- ✅ **Owner Management** - Store your business details
- ✅ **Buyer Profiles** - Manage customer information & GSTIN
- ✅ **Product Catalog** - Add products with HSN codes
- ✅ **Invoice Generation** - Create invoices with GST calculation
- ✅ **QR Codes** - Auto-generated QR codes on invoices
- ✅ **PDF Export** - Download invoices as PDF
- ✅ **Bank Integration** - Store and display bank details
- ✅ **Calculation** - Automatic IGST/CGST/SGST calculation
- ✅ **Round-off** - Support for round-off amounts

## File Locations

- **Application:** `C:\Program Files\Vuk Traders GST Invoice System\`
- **Configuration:** `C:\Program Files\Vuk Traders GST Invoice System\backend\.env`
- **Database:** PostgreSQL server (local)
- **Generated PDFs:** Saved to your Downloads or specified location
- **Logs:** `C:\Users\[YourName]\AppData\Local\Vuk Traders GST Invoice System\`

## Tips & Tricks

1. **Backup Invoices:** All data is in PostgreSQL - backup regularly
2. **Keyboard Shortcuts:**
   - `Ctrl+N` → New Invoice
   - `Ctrl+S` → Save Invoice
   - `Ctrl+P` → Print/PDF
3. **Admin Access:** Database admin user is `vuk_trader`
4. **Modify Invoices:** Edit buyer/product details, regenerate invoice

## Need Help?

1. Check the **Deployment Guide** for detailed instructions
2. Verify PostgreSQL is running (Services → search "postgresql")
3. Check `.env` file configuration
4. Look at application logs in AppData folder
5. Reinstall if all else fails

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Requires:** PostgreSQL 12+ | Windows 10+  
**Contact:** Check deployment guide for support info
