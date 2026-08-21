from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.db_models import User, UserRoleEnum
from app.repositories import user_repository


def register_user(db: Session, email: str, password: str, role: UserRoleEnum) -> User:
    if user_repository.get_by_email(db, email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    return user_repository.create_user(db, email, hash_password(password), role)


def authenticate(db: Session, email: str, password: str) -> str:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_access_token(subject=user.email, role=user.role.value)
