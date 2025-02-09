import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '@/lib/api';

export function usePortfolioHistory() {
    const query = useQuery({
        queryKey: ['portfolio-history'],
        queryFn: async () => {
            console.log('Fetching portfolio history...');
            const data = await portfolioApi.getHistory();
            console.log('Received data:', data);
            return data;
        },
    });

    console.log('Query state:', {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error
    };
}

export function useResetPortfolio() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: portfolioApi.reset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio-history'] });
            queryClient.invalidateQueries({ queryKey: ['trades'] });
            queryClient.invalidateQueries({ queryKey: ['trades', 'stats'] });
        },
    });
} 