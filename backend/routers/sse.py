import asyncio
from typing import Dict, List
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse


class SSEManager:
    """Tracks per-event subscriber queues for live reg count updates."""

    def __init__(self):
        self.subs: Dict[int, List[asyncio.Queue]] = {}

    async def connect(self, event_id: int, q: asyncio.Queue):
        self.subs.setdefault(event_id, []).append(q)

    def disconnect(self, event_id: int, q: asyncio.Queue):
        if event_id not in self.subs:
            return
        self.subs[event_id].remove(q)
        if not self.subs[event_id]:
            del self.subs[event_id]

    async def broadcast(self, event_id: int, count: int):
        for q in self.subs.get(event_id, []):
            await q.put(str(count))


manager = SSEManager()

router = APIRouter(tags=["sse"])


@router.get("/events/{event_id}/stream")
async def event_stream(event_id: int, request: Request):
    q: asyncio.Queue = asyncio.Queue()
    await manager.connect(event_id, q)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield {"data": data}
        except asyncio.CancelledError:
            pass
        finally:
            manager.disconnect(event_id, q)

    return EventSourceResponse(gen())
