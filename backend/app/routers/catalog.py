from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import ProductOut
from app.services import catalog_service

router = APIRouter(prefix="/catalog", tags=["Catalog"])


@router.get("/inventory", response_model=list[ProductOut])
def get_inventory(db: Session = Depends(get_db)):
    return catalog_service.get_inventory(db)
