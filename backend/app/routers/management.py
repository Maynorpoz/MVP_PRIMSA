from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.db_models import User, UserRoleEnum
from app.models.schemas import OrderOut
from app.services import order_service

router = APIRouter(prefix="/management", tags=["Management"])


@router.get("/daily-orders", response_model=list[OrderOut])
def get_daily_orders(
    day: date | None = Query(default=None, description="Defaults to today"),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role(UserRoleEnum.sales_admin_role)),
):
    return order_service.get_daily_orders(db, day)
