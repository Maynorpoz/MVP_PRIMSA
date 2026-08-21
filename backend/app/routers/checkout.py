from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.db_models import User, UserRoleEnum
from app.models.schemas import OrderCreate, OrderOut
from app.services import order_service

router = APIRouter(prefix="/checkout", tags=["Transactions"])


@router.post("/process-order", response_model=OrderOut, status_code=201)
def process_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRoleEnum.customer_role)),
):
    return order_service.process_order(db, current_user, payload)
