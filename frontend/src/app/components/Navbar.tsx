"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const dashLink = user.role === 'organizer'
        ? { href: '/dashboard/organizer', label: 'My Events' }
        : { href: '/dashboard/user', label: 'Browse Events' };

    return (
        <nav className="bg-slate-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            🎪 EventHub
                        </Link>
                        <Link
                            href={dashLink.href}
                            className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition"
                        >
                            {dashLink.label}
                        </Link>
                    </div>

                    {/* TODO(bonus): add a notification bell here — show upcoming event reminders & registration confirmations */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-300">
                            {user.username}
                            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full ml-1.5">
                                {user.role}
                            </span>
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm bg-red-600 px-3 py-1.5 rounded hover:bg-red-500 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
