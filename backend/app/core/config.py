from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    CHROMA_DB_PATH: str = "./chroma_db"
    VMD_SOURCE_DB_URL: str = ""  # sadece scripts/migrate_from_vmd.py kullanır

    class Config:
        env_file = ".env"


settings = Settings()
