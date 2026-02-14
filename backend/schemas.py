from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- User schemas ---

class UserBase(BaseModel):
    username: str
    email: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True


# --- Event schemas ---

class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: str

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    organizer_id: int
    created_at: datetime
    registration_count: int = 0
    class Config:
        from_attributes = True


# --- Registration ---

class RegistrationBase(BaseModel):
    event_id: int

class Registration(RegistrationBase):
    id: int
    user_id: int
    timestamp: datetime
    class Config:
        from_attributes = True


# --- Auth ---

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
