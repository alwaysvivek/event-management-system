"use client";

import { useState } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            await api.post('/users/register', { username, email, password, role });
            router.push('/login');
        } catch (err: any) {
            console.error('[register] signup failed', err);

            // backend sends specific messages like "Email already registered"
            const msg = err.response?.data?.detail;
            setError(typeof msg === 'string' ? msg : 'Registration failed');
        }
    }

    const canSubmit = username && email && password.length >= 4;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white text-black p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            minLength={4}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">I want to...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">Attend events</option>
                            <option value="organizer">Organize events</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full bg-green-600 text-white p-2.5 rounded hover:bg-green-700 disabled:opacity-50 transition font-medium"
                    >
                        Sign up
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
