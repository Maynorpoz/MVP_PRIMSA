from datetime import date, datetime, time

from sqlalchemy.orm import Session, joinedload

from app.models.db_models import Order, OrderItem


def create_order(db: Session, user_id: int, items: list[dict], total) -> Order:
    order = Order(user_id=user_id, status="created", total=total)
    order.items = [
        OrderItem(
            product_id=item["product_id"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
        )
        for item in items
    ]
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def list_by_day(db: Session, day: date) -> list[Order]:
    start = datetime.combine(day, time.min)
    end = datetime.combine(day, time.max)
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.created_at >= start, Order.created_at <= end)
        .order_by(Order.created_at.desc())
        .all()
    )
