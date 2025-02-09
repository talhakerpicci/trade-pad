"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@/types/trade";

interface PairProfitData {
    pair: string;
    profit: number;
    trades: number;
}

export function ProfitByPairChart() {
    const { trades } = useTrades();

    const calculateProfitByPair = (trades: Trade[]): PairProfitData[] => {
        const pairStats = trades.reduce((acc, trade) => {
            if (!acc[trade.market]) {
                acc[trade.market] = { profit: 0, trades: 0 };
            }

            if (trade.profit !== null) {
                acc[trade.market].profit += trade.profit;
                acc[trade.market].trades += 1;
            }

            return acc;
        }, {} as Record<string, { profit: number; trades: number }>);

        return Object.entries(pairStats).map(([pair, stats]) => ({
            pair,
            profit: Number(stats.profit.toFixed(2)),
            trades: stats.trades,
        }));
    };

    const data = trades.data ? calculateProfitByPair(trades.data as Trade[]) : [];

    if (trades.isLoading) {
        return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="pair" />
                    <YAxis
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        formatter={(value: number, name) => {
                            if (name === 'profit') {
                                return [`$${value.toLocaleString()}`, 'Profit/Loss'];
                            }
                            return [value, name];
                        }}
                        labelFormatter={(label) => `Trading Pair: ${label}`}
                    />
                    <Bar
                        dataKey="profit"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
} 