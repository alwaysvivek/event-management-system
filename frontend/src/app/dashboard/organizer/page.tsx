"use client";

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    organizer_id: number;
    registration_count: number;
}

export default function OrganizerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);

    // form fields — kept flat, not worth a form library for 4 fields
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (loading) return;
        if (!user || user.role !== 'organizer') {
            router.push('/login');
            return;
        }
        loadEvents();
    }, [user, loading, router]);

    async function loadEvents() {
        try {
            const res = await api.get('/events/');
            setEvents(res.data);
        } catch (err) {
            console.error('[organizer] failed to load events', err);
        }
    }

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/events/', {
                title, description: desc,
                date: new Date(date).toISOString(),
                location,
            });
            // reset form
            setTitle(''); setDesc(''); setDate(''); setLocation('');
            loadEvents();
        } catch (err) {
            alert('Failed to create event');
        }
    }

    async function onDelete(eventId: number) {
        if (!confirm('Delete this event? Registrations will also be removed.')) return;
        try {
            await api.delete(`/events/${eventId}`);
            loadEvents();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Delete failed');
        }
    }

    if (loading) return <p className="p-8 text-black">Loading...</p>;

    const canCreate = title && desc && date && location;

    return (
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-black">Organizer Dashboard</h1>

            <div className="bg-white text-black p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Create Event</h2>
                <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
                    <input className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <input className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
                    <input className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                    <textarea className="border border-gray-300 p-2.5 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What's the event about?" value={desc} onChange={e => setDesc(e.target.value)} required rows={3} />
                    <button
                        type="submit"
                        disabled={!canCreate}
                        className="bg-blue-600 text-white p-2.5 rounded-lg md:col-span-2 hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                    >
                        Create Event
                    </button>
                </form>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-black">
                Your Events {events.length > 0 && <span className="text-gray-400 font-normal">({events.length})</span>}
            </h2>

            {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events yet — create one above!</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((ev) => (
                        <div key={ev.id} className="bg-white text-black p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between"> {/* might want to extract this into its own component at some point */}
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{ev.title}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                        {ev.registration_count} reg.
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600" suppressHydrationWarning>
                                    {new Date(ev.date).toLocaleDateString()} · {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-gray-500 text-sm">{ev.location}</p>
                                <p className="mt-2 text-sm text-gray-700 line-clamp-3">{ev.description}</p>
                            </div>
                            <button
                                onClick={() => onDelete(ev.id)}
                                className="mt-4 w-full bg-red-50 text-red-600 border border-red-200 py-1.5 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
