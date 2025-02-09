"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    initialAmount: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (email: string, password: string, initialAmount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const PUBLIC_ROUTES = ['/login', '/signup'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [pathname]);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setIsLoading(false);
                if (!PUBLIC_ROUTES.includes(pathname || '')) {
                    router.push('/login');
                }
                return;
            }

            const response = await api.get('/users/current');
            setUser(response.data);
            if (PUBLIC_ROUTES.includes(pathname || '')) {
                router.push('/');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
            if (!PUBLIC_ROUTES.includes(pathname || '')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/users/signin', {
                email,
                password,
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.errors?.[0]?.message || 'Login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const signup = async (email: string, password: string, initialAmount: number) => {
        try {
            const response = await api.post('/users/signup', {
                email,
                password,
                initialAmount,
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            router.push('/');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 