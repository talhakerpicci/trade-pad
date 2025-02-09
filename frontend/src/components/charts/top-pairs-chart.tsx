"use client"

import { useState } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
} from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@/types/trade";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartDialog } from "./chart-dialog";
import { cn } from "@/lib/utils";

interface PairStats {
    pair: string;
    winRate: number;
    totalTrades: number;
    profit: number;
    score: number;
}

interface TopPairsChartProps {
    isExpanded: boolean;
    onExpandChange: (expanded: boolean) => void;
}

export function TopPairsChart({ isExpanded, onExpandChange }: TopPairsChartProps) {
    const { trades } = useTrades();

    const calculatePairStats = (trades: Trade[]): PairStats[] => {
        const pairMap = new Map<string, { wins: number; totalTrades: number; profit: number }>();

        trades.forEach(trade => {
            if (trade.sellTime) {  // Only count closed trades
                const current = pairMap.get(trade.market) || { wins: 0, totalTrades: 0, profit: 0 };

                pairMap.set(trade.market, {
                    wins: current.wins + (trade.profit && trade.profit > 0 ? 1 : 0),
                    totalTrades: current.totalTrades + 1,
                    profit: current.profit + (trade.profit || 0),
                });
            }
        });

        return Array.from(pairMap.entries())
            .map(([pair, stats]) => {
                const winRate = (stats.wins / stats.totalTrades) * 100;
                const score = winRate * (1 + Math.log10(stats.totalTrades));

                return {
                    pair,
                    winRate,
                    totalTrades: stats.totalTrades,
                    profit: stats.profit,
                    score
                };
            })
            .filter(stat => stat.totalTrades >= 5)  // Only include pairs with 5 or more trades
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);  // Take top 5 from filtered results
    };

    const data = trades.data ? calculatePairStats(trades.data as Trade[]) : [];

    if (trades.isLoading) {
        return <Skeleton className="h-[300px] w-full" />;
    }

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

    const formatValue = (value: number) => `${value.toFixed(1)}%`;

    const renderChart = (className?: string) => (
        <div className={cn("relative px-2 py-4", className)}>
            <ResponsiveContainer width="100%" height="95%">
                <BarChart
                    data={data}
                    margin={{ top: 15, right: 20, left: 0, bottom: 0 }}
                    layout="vertical"
                    style={{ backgroundColor: 'hsl(var(--background))' }}
                >
                    <XAxis
                        type="number"
                        tickFormatter={(value) => `${value.toFixed(0)}%`}
                        domain={[0, 100]}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        type="category"
                        dataKey="pair"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        width={100}
                    />
                    <Tooltip
                        formatter={(value: number, name) => {
                            if (name === 'winRate') {
                                return [
                                    `${value.toFixed(1)}% (${data.find(d => d.winRate === value)?.totalTrades} trades)`,
                                    'Win Rate'
                                ];
                            }
                            return [value, name];
                        }}
                        labelFormatter={(label) => label}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '6px',
                            padding: '8px',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            opacity: 1
                        }}
                        cursor={{ fill: 'transparent' }}
                        itemStyle={{
                            color: 'hsl(var(--popover-foreground))'
                        }}
                        wrapperStyle={{
                            outline: 'none'
                        }}
                        labelStyle={{
                            color: 'hsl(var(--popover-foreground))',
                            fontWeight: 600,
                            marginBottom: '4px',
                        }}
                    />
                    <Bar
                        dataKey="winRate"
                        radius={[0, 4, 4, 0]}
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <>
            {renderChart("h-[300px]")}

            <ChartDialog
                open={isExpanded}
                onOpenChange={onExpandChange}
                title="Top Trading Pairs"
            >
                {renderChart("h-full w-full")}
            </ChartDialog>
        </>
    );
} 