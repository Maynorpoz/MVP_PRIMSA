from sqlalchemy.orm import Session

from app.models.db_models import Product
from app.repositories import product_repository


def get_inventory(db: Session) -> list[Product]:
    return product_repository.list_all(db)
