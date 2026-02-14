"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            const form = new FormData();
            form.append('username', username);
            form.append('password', password);

            const res = await api.post('/users/token', form);
            login(res.data.access_token);
        } catch (err: any) {
            console.error('[login] failed', err);
            setError(err.response?.data?.detail || 'Login failed — check your credentials');
        }
    }

    const canSubmit = username.length > 0 && password.length > 0;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white text-black p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full bg-blue-600 text-white p-2.5 rounded hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                    >
                        Log in
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    No account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
