# Vuk Traders GST Invoice System - Installation & Usage Guide

## ⚡ Quick Start (2 minutes)

### Before You Start
1. **Install Python 3.10+** from [python.org](https://www.python.org/downloads/)
   - **IMPORTANT**: Check "Add Python to PATH" during installation!
   - Restart your computer after installing Python

2. **Run the Setup Script** (First time only)
   - In the `dist` folder, double-click `SETUP.bat`
   - This installs all Python dependencies
   - Wait for it to complete (2-3 minutes)

3. **Run the Application**
   - Double-click `Vuk Traders GST Invoice System-1.0.0-x64.exe`
   - The app launches automatically!

---

## System Requirements

- **Windows 10 or 11** (64-bit)
- **Python 3.10 or higher**
- **Internet** (for first setup only, then fully offline)
- **2 GB RAM** (minimum)
- **500 MB** free disk space

---

## Detailed Installation Steps

### Step 1: Install Python

If you don't have Python:
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Download **Python 3.10 or later** (latest version recommended)
3. **Run the installer**
4. ✓ **CHECK "Add Python to PATH"** (this is essential!)
5. Click "Install Now"
6. **Restart your computer** to apply PATH changes

**Verify Python Installation:**
- Open Command Prompt (`Win + R`, type `cmd`)
- Type: `python --version`
- You should see: `Python 3.x.x`

### Step 2: First Time Setup

1. Navigate to: `Vuk-Traders\dist\`
2. **Double-click** `SETUP.bat`
3. A black command window opens
4. **Wait** for it to say "Setup complete!"
   - First time: 2-3 minutes (installing 20+ packages)
   - Takes longer if you have a slow internet connection
5. Press any key to close the window

### Step 3: Run the Application

1. In the same `dist` folder, **double-click**:
   ```
   Vuk Traders GST Invoice System-1.0.0-x64.exe
   ```
2. The app starts automatically
3. First run may take 30-60 seconds (database setup)
4. Subsequent runs are instant

---

## Using the Application

### Dashboard
- Overview of your recent invoices
- Quick access to all features

### Owner Setup (First Time)
1. Click **Owner** in the menu
2. Enter your company details:
   - Company name
   - Address
   - **GST Number** (important!)
   - Email
3. Click Save

### Bank Details (Optional)
1. Click **Bank Details**
2. Add your bank account info (for invoice footer)
3. Click Save

### Products Setup
1. Click **Products**
2. Add each product/service you sell:
   - Product name
   - HSN/SAC code
   - Rate/Price
3. Click Save

### Buyers Setup
1. Click **Buyers**
2. Add each customer company:
   - Company name
   - GST Number(s)
   - Address details
3. Click Save

### Create an Invoice
1. Click **Create Invoice**
2. Select the buyer
3. Add invoice line items (products/services)
4. Review calculated totals
5. **Download PDF** or **Print**

---

## Data Storage & Backup

### Where is my data stored?
All your data is saved locally in:
```
C:\Users\YourUsername\AppData\Roaming\Vuk-Traders\vuk_traders.db
```

### How to Backup Your Data
1. Navigate to: `C:\Users\YourUsername\AppData\Roaming\`
2. Copy the folder: `Vuk-Traders`
3. Paste it to a safe location (USB drive, cloud storage, etc.)

### How to Restore Data
1. Copy your saved `Vuk-Traders` folder
2. Paste it back into: `C:\Users\YourUsername\AppData\Roaming\`
3. Replace the existing folder

---

## Troubleshooting

### "Python not found" Error
**Problem**: The app says Python 3.10+ is not installed

**Solution:**
1. Install Python from [python.org](https://www.python.org/downloads/)
2. **MUST CHECK**: "Add Python to PATH" during installation
3. Restart your computer
4. Try running the app again

**To verify Python is working:**
1. Open Command Prompt (`Win + R`, type `cmd`)
2. Type: `python --version`
3. Should show: `Python 3.x.x`

---

### "Backend Error" on First Launch
**Problem**: App shows "Failed to start backend server"

**Solution:**
1. Run `SETUP.bat` again (in the `dist` folder)
2. Wait for it to complete fully
3. Close the Command Prompt window
4. Try launching the app again

**If still not working:**
1. Delete folder: `C:\Users\YourUsername\AppData\Roaming\Vuk-Traders`
2. Run `SETUP.bat` again
3. Launch the app

---

### App Starts but Shows Blank Screen
**Problem**: The window opens but is blank/white

**Solution:**
1. Close the app completely (Ctrl+Alt+Delete → Task Manager → End task)
2. Wait 10 seconds
3. Reopen the app
4. If blank again, your antivirus might be blocking it

---

### Slow First Launch
**Problem**: App takes 1-2 minutes to start

**Solution:** This is normal! First launch:
- Initializes the database
- Sets up file folders
- Verifies dependencies

Subsequent launches are much faster!

---

### Can't Create Invoices / Data Not Saving
**Problem**: Invoices disappear or won't save

**Solution:**
1. Check file permissions:
   - Right-click `C:\Users\YourUsername\AppData\Roaming\Vuk-Traders`
   - Properties → Security
   - Ensure you have "Write" permission
   
2. Disable antivirus temporarily for the app

3. Clear browser cache:
   - Close the app
   - Delete: `C:\Users\YourUsername\AppData\Roaming\Vuk-Traders\vuk_traders.db`
   - Reopen the app (it will recreate the database)

---

## Features

✓ Create professional GST invoices  
✓ Automatic tax calculations (CGST/SGST)  
✓ Number-to-words conversion  
✓ QR code generation  
✓ PDF download & printing  
✓ Multiple buyer tracking  
✓ Product/Service catalog  
✓ Completely offline operation  
✓ Local data storage (no cloud)  
✓ No registration required  

---

## Uninstall

To remove the application:

1. Delete the `.exe` file from `dist` folder
2. Delete the data folder:
   ```
   C:\Users\YourUsername\AppData\Roaming\Vuk-Traders
   ```
3. Done! The app is completely removed

---

## Development & Advanced

### To run in development mode:
```bash
cd d:\Vuk-Traders
npm run dev
```

### To rebuild the executable:
```bash
npm run build-app
```

---

## Support

For issues or questions:
1. Check this guide first
2. Ensure Python is installed correctly
3. Run SETUP.bat again
4. Check that you have write permissions in AppData

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Support**: For assistance, refer to the backend logs in the development console.
