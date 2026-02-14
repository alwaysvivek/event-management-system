from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, events, sse
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Management Dashboard")

# wide open for dev — tighten in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(events.router)
app.include_router(sse.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Event Management API"}
