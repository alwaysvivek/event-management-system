from sqlalchemy.orm import Session
from . import models, schemas
from .auth import hash_password


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Event).offset(skip).limit(limit).all()


def create_event(db: Session, event: schemas.EventCreate, user_id: int):
    db_event = models.Event(**event.dict(), organizer_id=user_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def register_for_event(db: Session, event_id: int, user_id: int):
    # don't double-register, just return the existing one
    existing = db.query(models.Registration).filter_by(
        event_id=event_id, user_id=user_id
    ).first()
    if existing:
        return existing

    reg = models.Registration(event_id=event_id, user_id=user_id)
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


def get_reg_count(db: Session, event_id: int) -> int:
    return db.query(models.Registration).filter_by(event_id=event_id).count()
