from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import crud, models, schemas, auth, database
from . import sse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[schemas.Event])
def list_events(
    skip: int = 0, limit: int = 100,
    upcoming: bool = False,
    db: Session = Depends(database.get_db),
):
    if upcoming:
        # only future events, sorted soonest first
        events = (
            db.query(models.Event)
            .filter(models.Event.date >= datetime.now())
            .order_by(models.Event.date.asc())
            .offset(skip).limit(limit).all()
        )
    else:
        events = crud.get_events(db, skip=skip, limit=limit)

    # bolt on reg count per event. yeah it's N+1 but the
    # event list is capped at 100 so it's fine for now
    out = []
    for ev in events:
        d = schemas.Event.model_validate(ev).model_dump()
        d["registration_count"] = crud.get_reg_count(db, ev.id)
        out.append(d)
    return out


@router.post("/", response_model=schemas.Event)
async def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_user),
):
    if current_user.role != "organizer":
        raise HTTPException(status_code=403, detail="Organizers only")
    return crud.create_event(db, event, current_user.id)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_user),
):
    if current_user.role != "organizer":
        raise HTTPException(status_code=403, detail="Organizers only")

    event = db.query(models.Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your event")

    db.delete(event)
    db.commit()


@router.post("/{event_id}/register", response_model=schemas.Registration)
async def register(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_user),
):
    reg = crud.register_for_event(db, event_id, current_user.id)

    # push live count to anyone watching this event's stream
    count = crud.get_reg_count(db, event_id)
    await sse.manager.broadcast(event_id, count)

    # TODO(bonus): send email/push notification on registration + schedule reminders for upcoming event deadlines

    return reg


@router.get("/{event_id}/count")
def reg_count(event_id: int, db: Session = Depends(database.get_db)):
    return {"count": crud.get_reg_count(db, event_id)}
