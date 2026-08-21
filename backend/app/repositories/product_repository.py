from sqlalchemy.orm import Session

from app.models.db_models import Product


def list_all(db: Session) -> list[Product]:
    return db.query(Product).all()


def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def get_many_by_ids_for_update(db: Session, product_ids: list[int]) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    )
