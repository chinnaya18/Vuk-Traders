# Vuk Traders GST Invoice System - Deployment Guide

## System Requirements

- **Windows 10 or later** (64-bit)
- **PostgreSQL 12+** installed locally
- **At least 150 MB free disk space** for the application
- **Python 3.8+** (will be bundled with the app)

## Pre-Installation Steps

### 1. Install PostgreSQL

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the **superuser password** you set during installation
4. Keep the default port as **5432**

### 2. Create Database

After PostgreSQL is installed, create the database:

1. Open PowerShell as Administrator
2. Run the following commands:

```powershell
# Connect to PostgreSQL as superuser
psql -U postgres

# In the psql prompt, create the database and user:
CREATE DATABASE vuk_traders;
CREATE USER vuk_trader WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vuk_traders TO vuk_trader;
\q
```

3. Or use **pgAdmin** (included with PostgreSQL):
   - Open pgAdmin
   - Create a new database named `vuk_traders`
   - Create a new login role `vuk_trader` with password

## Installation

1. **Run the Installer:**
   - Double-click `Vuk Traders GST Invoice System-1.0.0.exe`
   - Follow the installation wizard
   - Choose your installation directory (default: `C:\Program Files\Vuk Traders GST Invoice System`)

2. **First-Time Setup:**
   - The app will automatically start the backend server
   - Wait for the interface to load (usually 10-15 seconds on first run)

## Configuration

### Environment Variables

The application uses a `.env` file for configuration. After installation:

1. Locate the installation directory
2. Find the `backend/.env` file
3. Update the `DATABASE_URL` if needed:

```
DATABASE_URL=postgresql+psycopg://vuk_trader:your_secure_password@localhost:5432/vuk_traders
APP_NAME=Vuk Traders GST Invoice System
DEBUG=false
```

**Replace:**
- `your_secure_password` with the password you set for the `vuk_trader` user

## Running the Application

1. **Start the App:**
   - Double-click the Vuk Traders shortcut on your desktop
   - Or find it in Start Menu → Vuk Traders

2. **First Launch:**
   - The app will initialize the database automatically
   - Wait for the interface to appear
   - You'll see the Buyers, Invoices, and other management pages

3. **Creating Data:**
   - Go to "Owner" page to set up your business details
   - Go to "Bank Details" to add your bank information
   - Add Products and Buyers
   - Create and manage Invoices

## Troubleshooting

### App Won't Start

1. **Check PostgreSQL:**
   ```powershell
   # Verify PostgreSQL is running
   Get-Service | findstr postgres
   ```
   If not running, start it from Services.msc

2. **Check Database Connection:**
   ```powershell
   # Test database connection
   psql -U vuk_trader -d vuk_traders -h localhost
   # If prompted for password, enter it and type \q to exit
   ```

3. **Check Firewall:**
   - Ensure localhost access isn't blocked
   - Check Windows Defender or third-party firewall

### Database Won't Connect

- Verify DATABASE_URL in `.env` file is correct
- Check PostgreSQL is running on port 5432
- Verify username/password are correct
- Ensure vuk_traders database exists

### App Crashes

1. Check logs in:
   - `C:\Users\[YourUsername]\AppData\Local\Vuk Traders GST Invoice System`
   - Look for error logs

2. Restart the application
3. If issue persists, reinstall the application

## Uninstallation

1. Go to **Settings** → **Apps** → **Apps & Features**
2. Find "Vuk Traders GST Invoice System"
3. Click **Uninstall**
4. Follow the uninstall wizard

**Note:** Uninstalling the app does NOT delete your database. Your PostgreSQL data remains safe.

## Backup & Recovery

### Backup Your Data

```powershell
# Backup the database
pg_dump -U vuk_trader -d vuk_traders -F c -b -v -f "C:\Backups\vuk_traders_backup.dump"
```

### Restore Your Data

```powershell
# Restore the database
pg_restore -U vuk_trader -d vuk_traders -F c "C:\Backups\vuk_traders_backup.dump"
```

## Performance Tips

1. **First Run:** The app may take 15-30 seconds to start. This is normal.
2. **Database Optimization:** Run maintenance on PostgreSQL weekly
3. **Disk Space:** Keep at least 500 MB free for optimal performance

## Support & Updates

- For issues, check the app logs in `AppData\Local\Vuk Traders GST Invoice System`
- Keep PostgreSQL updated for security patches
- The app checks for data integrity on startup

## Advanced Configuration

### Port Customization

If you need to change the backend port (default: 8000):

1. Edit `backend/.env`:
   ```
   BACKEND_PORT=8001
   ```

2. Restart the application

### Debug Mode

To enable debug logging:

1. Edit `backend/.env`:
   ```
   DEBUG=true
   ```

2. Restart the application
3. Logs will show more detailed information

---

**Version:** 1.0.0  
**Last Updated:** May 2026
