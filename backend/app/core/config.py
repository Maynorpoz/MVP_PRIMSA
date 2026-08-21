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

    # Comma-separated list of origins allowed to call this API from a browser
    # (e.g. the frontend's own origin). Required for the frontend to work at
    # all: without CORS headers, the browser blocks every cross-origin
    # request regardless of a valid JWT. Never use "*" together with
    # allow_credentials in production.
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
