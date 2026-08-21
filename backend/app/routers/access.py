from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import LoginRequest, Token, UserCreate, UserOut
from app.services import auth_service

router = APIRouter(prefix="/access", tags=["Access Control"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, payload.email, payload.password, payload.role)
    return user


@router.post("/authenticate", response_model=Token)
def authenticate(payload: LoginRequest, db: Session = Depends(get_db)):
    access_token = auth_service.authenticate(db, payload.email, payload.password)
    return Token(access_token=access_token)
