import axios from 'axios';
import { PortfolioHistory, Trade } from '@/types/trade';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Update the response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export const authApi = {
    signup: async (data: { email: string; password: string; initialAmount: number }) => {
        const response = await api.post('/users/signup', data);
        return response.data;
    },

    signin: async (data: { email: string; password: string }) => {
        const response = await api.post('/users/signin', data);
        return response.data;
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('getCurrentUser error:', error);
            throw error;
        }
    },
};

export const tradesApi = {
    getTrades: () =>
        api.get('/trades').then(res => res.data),

    getStats: () =>
        api.get('/trades/stats').then(res => res.data),

    createTrade: (data: { market: string; buyPrice: number; quantity: number }) =>
        api.post('/trades', data).then(res => res.data),

    closeTrade: (tradeId: string, data: { sellPrice: number; sellTime: Date }) =>
        api.patch(`/trades/${tradeId}`, data).then(res => res.data),

    updateTrade: async (id: string, data: Partial<Trade>) => {
        const response = await api.put(`/trades/${id}`, data);
        return response.data;
    },

    deleteTrade: async (id: string) => {
        await api.delete(`/trades/${id}`);
    },
};

export const portfolioApi = {
    reset: async (newAmount: number) => {
        const response = await api.post('/portfolio/reset', { newAmount });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get<{ history: PortfolioHistory[] }>('/portfolio/history');
        return response.data;
    },
};

export { api }; 