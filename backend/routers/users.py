from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from .. import crud, schemas, auth, database

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username taken")
    return crud.create_user(db, user)


@router.get("/me", response_model=schemas.User)
async def me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user


@router.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.check_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bad username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth.create_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.TOKEN_EXPIRE_MIN),
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role}
