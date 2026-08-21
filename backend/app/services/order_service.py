from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.db_models import Order, User
from app.models.schemas import OrderCreate
from app.repositories import order_repository, product_repository


def process_order(db: Session, user: User, order_in: OrderCreate) -> Order:
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An order must contain at least one item",
        )

    product_ids = [item.product_id for item in order_in.items]
    products = {p.id: p for p in product_repository.get_many_by_ids(db, product_ids)}

    missing_ids = [pid for pid in product_ids if pid not in products]
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {missing_ids}",
        )

    order_items = []
    total = 0
    for item in order_in.items:
        product = products[item.product_id]
        if item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid quantity for product {item.product_id}",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'",
            )
        order_items.append(
            {
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": product.price,
            }
        )
        total += product.price * item.quantity
        product.stock -= item.quantity

    order = order_repository.create_order(db, user_id=user.id, items=order_items, total=total)
    return order


def get_daily_orders(db: Session, day: date | None = None) -> list[Order]:
    return order_repository.list_by_day(db, day or date.today())
