from sqlalchemy.orm import Session

from app.core.config import settings
from app.services import auth_service
from app.repositories import user_repository


def ensure_first_admin(db: Session) -> None:
    if not settings.FIRST_ADMIN_EMAIL or not settings.FIRST_ADMIN_PASSWORD:
        return
    if user_repository.get_by_email(db, settings.FIRST_ADMIN_EMAIL) is not None:
        return
    auth_service.create_admin(db, settings.FIRST_ADMIN_EMAIL, settings.FIRST_ADMIN_PASSWORD)
