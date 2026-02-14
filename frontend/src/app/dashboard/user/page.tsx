"use client";

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEventStream } from '../../hooks/useEventStream';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    registration_count: number;
}

// pulled out so each card gets its own SSE connection
function EventCard({ event }: { event: Event }) {
    const count = useEventStream(event.id, event.registration_count);

    const isUpcoming = new Date(event.date) > new Date();

    async function onRegister() {
        try {
            await api.post(`/events/${event.id}/register`);
            alert(`You're in! Registered for "${event.title}"`);
        } catch (err: any) {
            // backend returns different error shapes depending on what went wrong...
            const msg = err.response?.data?.detail;
            if (msg) {
                alert(msg);
            } else {
                alert('Something went wrong');
            }
        }
    }

    return (
        <div className="bg-white p-5 text-black rounded-lg shadow border border-gray-200 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    {isUpcoming
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Upcoming</span>
                        : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Past</span>
                    }
                </div>
                <p className="text-gray-600 text-sm" suppressHydrationWarning>
                    {new Date(event.date).toLocaleDateString()} · {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-500 text-sm">{event.location}</p>
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">{event.description}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-600">{count} registered</span>
                <button
                    onClick={onRegister}
                    disabled={!isUpcoming}
                    className={`px-4 py-2 rounded-lg text-sm text-white font-medium transition
            ${isUpcoming ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isUpcoming ? 'Register' : 'Ended'}
                </button>
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [upcomingOnly, setUpcomingOnly] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) { router.push('/login'); return; }
        loadEvents();
    }, [user, loading, router, upcomingOnly]);

    async function loadEvents() {
        try {
            const res = await api.get(`/events/?upcoming=${upcomingOnly}`);
            setEvents(res.data);
        } catch (err) {
            console.error('[user] failed to load events', err);
        }
    }

    if (loading) return <p className="p-8 text-black">Loading...</p>;

    return (
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-black">Browse Events</h1>

                {/* toggle — just two buttons, overkill to use a library */}
                <div className="flex bg-white text-black border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setUpcomingOnly(true)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${upcomingOnly ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setUpcomingOnly(false)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${!upcomingOnly ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                    >
                        All
                    </button>
                </div>
            </div>

            {events.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                    {upcomingOnly ? 'No upcoming events right now.' : 'No events found.'}
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
                </div>
            )}
        </div>
    );
}
