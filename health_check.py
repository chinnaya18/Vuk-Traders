#!/usr/bin/env python3
"""
Vuk Traders System Health Check
Verifies that all components are properly configured
"""

import os
import sys
import json
from pathlib import Path

def check_postgresql_installed():
    """Check if PostgreSQL is installed and accessible"""
    try:
        import subprocess
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            return True, result.stdout.strip()
    except FileNotFoundError:
        pass
    return False, "PostgreSQL not found in PATH"

def check_database_connection(host, port, user, password, database):
    """Check if database is accessible"""
    try:
        import psycopg
        conn = psycopg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=database
        )
        conn.close()
        return True, "Connected successfully"
    except Exception as e:
        return False, str(e)

def check_env_file(env_path):
    """Check if .env file exists and is readable"""
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r') as f:
                content = f.read()
                if 'DATABASE_URL' in content:
                    return True, ".env file found with DATABASE_URL"
                else:
                    return False, ".env file missing DATABASE_URL"
        except Exception as e:
            return False, f"Error reading .env: {str(e)}"
    return False, ".env file not found"

def parse_database_url(url):
    """Parse PostgreSQL connection URL"""
    try:
        # Format: postgresql+psycopg://user:password@host:port/database
        url = url.replace('postgresql+psycopg://', '')
        credentials, rest = url.split('@')
        user, password = credentials.split(':')
        host_port, database = rest.split('/')
        host, port = host_port.split(':')
        return {
            'user': user,
            'password': password,
            'host': host,
            'port': int(port),
            'database': database
        }
    except Exception as e:
        return None

def main():
    print("=" * 60)
    print("Vuk Traders System Health Check")
    print("=" * 60)
    print()

    # Check Python version
    print("1. Python Version")
    print(f"   Version: {sys.version.split()[0]}")
    print("   ✓ OK" if sys.version_info >= (3, 8) else "   ✗ Python 3.8+ required")
    print()

    # Check PostgreSQL installation
    print("2. PostgreSQL Installation")
    pg_installed, pg_msg = check_postgresql_installed()
    if pg_installed:
        print(f"   {pg_msg}")
        print("   ✓ OK")
    else:
        print(f"   {pg_msg}")
        print("   ✗ NOT FOUND - Download from https://www.postgresql.org/download/windows/")
    print()

    # Check .env file
    print("3. Environment Configuration")
    env_files = [
        "backend/.env",
        "../backend/.env",
        "C:\\Program Files\\Vuk Traders GST Invoice System\\backend\\.env"
    ]
    
    env_found = False
    env_path = None
    for path in env_files:
        if os.path.exists(path):
            env_found = True
            env_path = path
            break
    
    if env_found:
        env_ok, env_msg = check_env_file(env_path)
        print(f"   Found at: {env_path}")
        print(f"   {env_msg}")
        print("   ✓ OK" if env_ok else "   ✗ ERROR")
    else:
        print("   .env file not found")
        print("   ✗ ERROR - Check installation directory")
    print()

    # Check database connection
    print("4. Database Connectivity")
    if env_found and env_path:
        try:
            with open(env_path, 'r') as f:
                for line in f:
                    if line.startswith('DATABASE_URL'):
                        db_url = line.split('=', 1)[1].strip()
                        db_config = parse_database_url(db_url)
                        
                        if db_config:
                            print(f"   Host: {db_config['host']}")
                            print(f"   Port: {db_config['port']}")
                            print(f"   Database: {db_config['database']}")
                            print(f"   User: {db_config['user']}")
                            
                            if pg_installed:
                                try:
                                    import psycopg
                                    conn_ok, conn_msg = check_database_connection(
                                        db_config['host'],
                                        db_config['port'],
                                        db_config['user'],
                                        db_config['password'],
                                        db_config['database']
                                    )
                                    if conn_ok:
                                        print(f"   {conn_msg}")
                                        print("   ✓ OK")
                                    else:
                                        print(f"   ✗ Connection failed: {conn_msg}")
                                except ImportError:
                                    print("   Note: psycopg not installed in this Python")
                                    print("   (This is OK if using the bundled Python)")
                            else:
                                print("   (Cannot test - PostgreSQL not found)")
                        break
        except Exception as e:
            print(f"   Error checking database: {e}")
    else:
        print("   Cannot test - .env file not found")
    print()

    # Summary
    print("=" * 60)
    print("Recommendations:")
    print("=" * 60)
    print()
    
    if not pg_installed:
        print("1. Install PostgreSQL:")
        print("   - Download: https://www.postgresql.org/download/windows/")
        print("   - Add to PATH during installation")
        print("   - Run setup_database.bat after installation")
        print()
    
    print("2. Start the application:")
    print("   - Double-click: Vuk Traders GST Invoice System-1.0.0.exe")
    print()
    
    print("3. If issues persist:")
    print("   - Check DEPLOYMENT_GUIDE.md")
    print("   - Verify PostgreSQL is running")
    print("   - Review application logs in AppData\\Local")
    print()

if __name__ == "__main__":
    main()
