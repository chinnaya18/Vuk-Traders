from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "Vuk Traders GST Invoice System"
    DEBUG: bool = True
    DATABASE_URL: str = ""  # Will be set by __init__
    
    def __init__(self, **data):
        super().__init__(**data)
        
        # Override DATABASE_URL based on environment
        if os.environ.get('ELECTRON_APP'):
            # Running in Electron - use app data directory
            if os.name == 'nt':  # Windows
                app_data = os.environ.get('APPDATA', os.path.expanduser('~\\AppData\\Roaming'))
                db_dir = os.path.join(app_data, 'Vuk-Traders')
            else:  # Unix/Linux/macOS
                db_dir = os.path.expanduser('~/.vuk-traders')
            
            # Create directory if it doesn't exist
            os.makedirs(db_dir, exist_ok=True)
            db_path = os.path.join(db_dir, 'vuk_traders.db')
            print(f"[Config] Using app data database: {db_path}")
        else:
            # Development mode - use project directory
            db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'vuk_traders.db')
            print(f"[Config] Using development database: {db_path}")
        
        # Convert path to URI format for SQLite
        # Handle Windows paths (C:\path\to\db -> ///C:/path/to/db)
        if os.name == 'nt':
            db_path = db_path.replace('\\', '/')
            if db_path[1] == ':':  # Windows drive letter
                self.DATABASE_URL = f'sqlite:///{db_path}'
            else:
                self.DATABASE_URL = f'sqlite:///{db_path}'
        else:
            self.DATABASE_URL = f'sqlite:///{db_path}'

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
