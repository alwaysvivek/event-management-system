# Event Management Dashboard

A full-stack event management app — organizers create events, users browse and register. Registration counts update in real-time via SSE.

## What it does

- **Auth** — signup/login with JWT, passwords hashed with argon2
- **Organizer dashboard** — create events, see registration counts, delete your own events
- **User dashboard** — browse upcoming/all events, register, see live attendee counts
- **Real-time** — SSE streams push registration count updates to all connected clients
- **Role-based access** — organizers and regular users see different dashboards


## How to run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# create a postgres db called event_db first
# then update DATABASE_URL in database.py (or copy .env.example to .env)

uvicorn backend.main:app --reload
```

Runs on `http://localhost:8000`. API docs at `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.
