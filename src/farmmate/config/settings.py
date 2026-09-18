"""
Configuration settings for FarmMate
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Central configuration class for FarmMate project paths and keys."""
    
    # Base directory (d:\FarmMate)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    
    # Paths
    DATA_DIR: Path = BASE_DIR / "data"
    RAW_DATA_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
    MODELS_DIR: Path = BASE_DIR / "models"
    DOCS_DIR: Path = BASE_DIR / "docs"
    
    # OpenWeatherMap API Key
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
