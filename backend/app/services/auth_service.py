from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.db_models import User, UserRoleEnum
from app.repositories import user_repository


def _create_user_with_role(db: Session, email: str, password: str, role: UserRoleEnum) -> User:
    if user_repository.get_by_email(db, email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    return user_repository.create_user(db, email, hash_password(password), role)


def register_user(db: Session, email: str, password: str) -> User:
    # Public self-registration always creates a customer_role account. The role
    # must never come from client input here, or any caller could self-grant
    # sales_admin_role. Admins are created only via create_admin, which is
    # itself gated behind an existing sales_admin_role token.
    return _create_user_with_role(db, email, password, UserRoleEnum.customer_role)


def create_admin(db: Session, email: str, password: str) -> User:
    return _create_user_with_role(db, email, password, UserRoleEnum.sales_admin_role)


def authenticate(db: Session, email: str, password: str) -> str:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_access_token(subject=user.email, role=user.role.value)
