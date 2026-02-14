import { useEffect, useState } from 'react';

// listens to SSE stream for live registration count updates
// falls back to initialCount if the stream dies
export function useEventStream(eventId: number, initialCount: number) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        const src = new EventSource(`http://localhost:8000/events/${eventId}/stream`);

        src.onmessage = (msg) => {
            const n = parseInt(msg.data, 10);
            if (!isNaN(n)) setCount(n);
        };

        src.onerror = () => {
            // SSE reconnects automatically, but if it keeps failing just close it
            // TODO: maybe show a "live updates paused" indicator
            console.warn(`[sse] stream for event ${eventId} errored`);
            src.close();
        };

        return () => src.close();
    }, [eventId]);

    return count;
}
