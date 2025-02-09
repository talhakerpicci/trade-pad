import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradesApi } from '@/lib/api';
import { Trade } from '@/types/trade';

interface TradeResponse {
    id: string;
    market: string;
    buyPrice: number;
    sellPrice: number | null;
    quantity: number;
    buyTime: string | Date;
    sellTime: string | Date | null;
    profit: number | null;
    userId: string;
    isActive: boolean;
    portfolioHistoryId: string | null;
    createdAt: string;
    updatedAt: string;
}

const transformTrade = (trade: TradeResponse): Trade => ({
    ...trade,
    buyTime: trade.buyTime instanceof Date ? trade.buyTime.toISOString() : trade.buyTime,
    sellTime: trade.sellTime instanceof Date ? trade.sellTime.toISOString() : trade.sellTime,
});

export function useTrades() {
    const queryClient = useQueryClient();

    const trades = useQuery<TradeResponse[], Error>({
        queryKey: ['trades'],
        queryFn: tradesApi.getTrades,
        select: (data) => data.map(transformTrade),
    });

    const stats = useQuery({
        queryKey: ['trades', 'stats'],
        queryFn: tradesApi.getStats,
    });

    const createTrade = useMutation({
        mutationFn: tradesApi.createTrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['trades', 'stats'] });
        },
    });

    const closeTrade = useMutation({
        mutationFn: ({ tradeId, data }: { tradeId: string; data: { sellPrice: number; sellTime: Date } }) =>
            tradesApi.closeTrade(tradeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['trades', 'stats'] });
        },
    });

    const updateTrade = useMutation({
        mutationFn: async (data: Partial<Trade> & { id: string }) => {
            const response = await tradesApi.updateTrade(data.id, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['trades', 'stats'] });
        }
    });

    const deleteTrade = useMutation({
        mutationFn: async (id: string) => {
            await tradesApi.deleteTrade(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['trades', 'stats'] });
        }
    });

    return {
        trades,
        stats,
        createTrade,
        closeTrade,
        updateTrade: updateTrade.mutateAsync,
        deleteTrade: deleteTrade.mutateAsync,
    };
} 