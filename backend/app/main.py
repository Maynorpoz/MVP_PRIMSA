from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.bootstrap import ensure_first_admin
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.routers import access, catalog, checkout, management


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_first_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.include_router(access.router)
app.include_router(catalog.router)
app.include_router(checkout.router)
app.include_router(management.router)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
