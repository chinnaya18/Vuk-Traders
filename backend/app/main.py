from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base

# Import all models to ensure they are registered with Base
from app.models import Owner, Buyer, Invoice, InvoiceItem, BankDetails, Product  # noqa: F401

try:
    settings = get_settings()
    print(f"[Main] App: {settings.APP_NAME}")
    print(f"[Main] Database: {settings.DATABASE_URL}")
except Exception as e:
    print(f"[Main] Error loading settings: {e}")
    raise

app = FastAPI(
    title=settings.APP_NAME,
    description="GST Invoice Generation System for Vuk Traders",
    version="1.0.0",
)

# CORS middleware - allow both dev and Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "file://*",  # For Electron app
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (for development — use Alembic in production)
try:
    print("[Main] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[Main] Database tables created successfully")
except Exception as e:
    print(f"[Main] Error creating tables: {e}")
    raise

# Include routers
from app.routes import owner, buyers, invoices, bank_details, products
app.include_router(owner.router)
app.include_router(buyers.router)
app.include_router(invoices.router)
app.include_router(bank_details.router)
app.include_router(products.router)

print("[Main] All routers registered successfully")


@app.get("/")
def root():
    return {
        "message": "Vuk Traders GST Invoice System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
