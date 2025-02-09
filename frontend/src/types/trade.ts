export interface Trade {
    id: string;
    market: string;
    buyTime: string;
    sellTime: string | null;
    buyPrice: number;
    sellPrice: number | null;
    quantity: number;
    profit: number | null;
    userId: string;
    isActive: boolean;
    portfolioHistoryId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioHistory {
    id: string;
    userId: string;
    startDate: string;
    endDate: string | null;
    initialAmount: number;
    finalAmount: number | null;
    trades: Trade[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateTradeDTO {
    market: string;
    buyPrice: number;
    quantity: number;
}

export interface UpdateTradeDTO {
    sellPrice: number;
    sellTime: Date;
}

export interface TradeStats {
    totalProfit: number;
    winRate: number;
    portfolioValue: number;
    bestPerformingPair: {
        market: string;
        return: number;
    } | null;
} 