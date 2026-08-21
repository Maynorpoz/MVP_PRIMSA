from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Primsa MVP Backend"

    DATABASE_URL: str = "postgresql+psycopg2://primsa:primsa@postgres_db:5432/primsa"

    SECRET_KEY: str = "change-this-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Optional one-time bootstrap for the first sales_admin_role account, since
    # /access/admins requires an existing admin token and can't create one.
    # Leave unset in normal operation; only needed to seed the very first admin.
    FIRST_ADMIN_EMAIL: str | None = None
    FIRST_ADMIN_PASSWORD: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
