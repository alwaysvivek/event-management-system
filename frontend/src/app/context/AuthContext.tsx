"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../utils/api';

interface User {
    username: string;
    email: string;
    role: 'organizer' | 'user';
}

interface AuthCtx {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // on mount, try to restore session from cookie
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/users/me')
            .then((res) => setUser(res.data))
            .catch((err) => {
                console.warn('[auth] token expired or invalid, clearing', err);
                Cookies.remove('token');
            })
            .finally(() => setLoading(false));
    }, []);

    function login(token: string) {
        Cookies.set('token', token);
        // fetch profile then redirect based on role
        api.get('/users/me').then((res) => {
            setUser(res.data);
            const dest = res.data.role === 'organizer'
                ? '/dashboard/organizer'
                : '/dashboard/user';
            router.push(dest);
        });
    }

    function logout() {
        Cookies.remove('token');
        setUser(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
