from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.db_models import User, UserRoleEnum
from app.models.schemas import LoginRequest, Token, UserCreate, UserOut
from app.services import auth_service

router = APIRouter(prefix="/access", tags=["Access Control"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Public self-registration. Always creates a customer_role account."""
    user = auth_service.register_user(db, payload.email, payload.password)
    return user


@router.post("/authenticate", response_model=Token)
def authenticate(payload: LoginRequest, db: Session = Depends(get_db)):
    access_token = auth_service.authenticate(db, payload.email, payload.password)
    return Token(access_token=access_token)


@router.post("/admins", response_model=UserOut, status_code=201)
def create_admin(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role(UserRoleEnum.sales_admin_role)),
):
    """Creates a sales_admin_role account. Requires an existing admin's token."""
    user = auth_service.create_admin(db, payload.email, payload.password)
    return user
