from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(access.router)
app.include_router(catalog.router)
app.include_router(checkout.router)
app.include_router(management.router)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
