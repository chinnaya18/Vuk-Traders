# Vuk Traders GST Invoice System

> A professional desktop application for managing GST invoices with QR codes

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2B-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

## 📦 What You Have

This is a **complete standalone desktop application** for your Vuk Traders business. It includes:

- **Frontend UI** - Built with React and Vite (fast, modern interface)
- **Backend API** - FastAPI server (handles all business logic)
- **Database** - PostgreSQL integration (local installation required)
- **Packaging** - Electron wrapper (runs as native Windows app)

### Built Files Location

```
D:\Vuk-Traders\dist\
├── Vuk Traders GST Invoice System-1.0.0.exe  ← Main executable (89 MB)
└── win-unpacked/                             ← Unpacked application files
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Windows 10 or later** (64-bit)
- **PostgreSQL 12+** (must be installed separately)
- **At least 200 MB** free disk space

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer and remember your superuser password
3. Keep default port: 5432

### Step 2: Set Up Database
Run the included setup script (in Administrator mode):
```bash
setup_database.bat
```
Follow the prompts - it will create the database automatically.

### Step 3: Run the Application
Double-click: `Vuk Traders GST Invoice System-1.0.0.exe`

The app will:
1. Start the backend server automatically
2. Load the React UI
3. Initialize the database
4. Display the main interface

## 📋 Features

### Owner Management
- Store business information
- GST registration details
- Company branding

### Buyer Profiles
- Add and manage customers
- Store GSTIN numbers
- Track buyer details

### Product Catalog
- Create product inventory
- Set HSN/SAC codes
- Manage pricing

### Invoice Generation
- Create professional invoices
- Automatic GST calculation (IGST/CGST/SGST)
- QR code generation
- Round-off support
- PDF export

### Bank Details
- Store multiple bank accounts
- Display on invoices
- Easy management

## 🛠️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Electron Wrapper                       │
│  (Wraps both frontend and backend)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │   React UI       │    │  FastAPI Backend │      │
│  │  (Port 5173)     │    │  (Port 8000)     │      │
│  │                  │←──→│                  │      │
│  │  Components:     │    │  - Owner routes  │      │
│  │  - Dashboard     │    │  - Invoice API   │      │
│  │  - Invoices      │    │  - Products API  │      │
│  │  - Buyers        │    │  - Buyers API    │      │
│  │  - Products      │    │  - Bank API      │      │
│  │  - Bank Details  │    │  - PDF Generator │      │
│  │  - Owner         │    │  - QR Generator  │      │
│  └──────────────────┘    └──────────────────┘      │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │      PostgreSQL Database (Local)               │  │
│  │  - Tables: invoices, products, buyers, etc.   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
D:\Vuk-Traders\
├── electron-main.js           # Electron entry point
├── electron-preload.js        # Electron preload script
├── icon.png                   # Application icon
├── package.json               # Root configuration
├── frontend/                  # React application
│   ├── src/
│   ├── dist/                  # Built files
│   └── package.json
├── backend/                   # FastAPI application
│   ├── app/
│   ├── .env                   # Database configuration
│   ├── requirements.txt
│   └── alembic/               # Database migrations
└── dist/                      # Built executables
    └── Vuk Traders GST Invoice System-1.0.0.exe
```

## ⚙️ Configuration

### Database Configuration (`.env` file)
Located at: `C:\Program Files\Vuk Traders GST Invoice System\backend\.env`

```env
DATABASE_URL=postgresql+psycopg://vuk_trader:password@localhost:5432/vuk_traders
APP_NAME=Vuk Traders GST Invoice System
DEBUG=false
```

### Backend Port
Default: `8000` (modify in `.env` if needed)

### Frontend Port
Default: `5173` (development mode)

## 🔧 Development & Customization

### Building from Source
```bash
# Install dependencies
npm install
cd frontend && npm install

# Build
npm run build-app

# Output: D:\Vuk-Traders\dist\Vuk Traders GST Invoice System-1.0.0.exe
```

### Running in Development Mode
```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Electron
npm run dev
```

## 🐛 Troubleshooting

### App Won't Start
1. Check if PostgreSQL service is running:
   ```powershell
   Get-Service | findstr postgres
   ```
2. Verify database credentials in `.env`
3. Check Windows Firewall doesn't block localhost

### "Port 8000 already in use"
- Close other applications
- Or change port in `.env` file
- Restart the app

### Database Connection Failed
1. Verify PostgreSQL is installed and running
2. Check `.env` file DATABASE_URL is correct
3. Verify username/password are correct
4. Test connection:
   ```powershell
   psql -U vuk_trader -d vuk_traders -h localhost
   ```

### App Crashes on Startup
1. Check logs in: `C:\Users\[YourName]\AppData\Local\Vuk Traders GST Invoice System`
2. Verify `.env` file syntax is correct
3. Make sure database exists: `CREATE DATABASE vuk_traders;`

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide (30 seconds)
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full deployment instructions
- **[setup_database.bat](./setup_database.bat)** - Automated database setup

## 💾 Backup & Restore

### Backup Database
```powershell
pg_dump -U vuk_trader -d vuk_traders -F c -b -v -f "C:\Backups\vuk_traders_backup.dump"
```

### Restore Database
```powershell
pg_restore -U vuk_trader -d vuk_traders -F c "C:\Backups\vuk_traders_backup.dump"
```

## 🔒 Security Considerations

1. **Database Password**: Change from default after installation
2. **Firewall**: Keep app restricted to localhost only
3. **Backups**: Regularly backup your PostgreSQL database
4. **Updates**: Keep PostgreSQL updated for security patches
5. **Network**: Don't expose the backend to external networks

## 📊 System Requirements

| Component | Requirement |
|-----------|------------|
| OS | Windows 10, 11 (64-bit) |
| RAM | 2 GB minimum, 4 GB recommended |
| Disk Space | 200 MB for app + PostgreSQL size |
| Display | 1024x768 minimum (1366x768 recommended) |
| Database | PostgreSQL 12+ |
| Network | Local only |

## 🚢 Deployment

### Single Machine Setup
1. Install PostgreSQL on the target machine
2. Run database setup script
3. Deploy the .exe file
4. Users can double-click to run

### Multiple Machines
- Each machine needs its own PostgreSQL installation
- Or set up a centralized PostgreSQL server
- Update DATABASE_URL in `.env` accordingly

## 🔄 Updates & Maintenance

### Regular Tasks
- Back up database weekly
- Monitor disk space
- Update PostgreSQL for security patches
- Clean old PDF files periodically

### Version Updates
To update to a new version:
1. Uninstall current version
2. Install new .exe
3. Database migrations run automatically
4. Your data remains intact

## 📝 License

This application is proprietary software for Vuk Traders.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review DEPLOYMENT_GUIDE.md
3. Check application logs in AppData folder
4. Verify database is running and accessible

## 🎉 You're Ready!

Your Vuk Traders application is ready to use. Start with QUICKSTART.md for step-by-step instructions.

---

**Version:** 1.0.0  
**Built:** May 2026  
**Platform:** Windows 10+ (64-bit)  
**Status:** ✅ Production Ready
