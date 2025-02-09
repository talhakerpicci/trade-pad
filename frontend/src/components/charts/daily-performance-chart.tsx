"use client"

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@/types/trade";
import { format, startOfDay, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { ChartDialog } from "./chart-dialog";
import { cn } from "@/lib/utils";

interface DailyPerformanceData {
    date: string;
    profit: number;
    trades: number;
}

interface DailyPerformanceChartProps {
    isExpanded: boolean;
    onExpandChange: (expanded: boolean) => void;
}

export function DailyPerformanceChart({ isExpanded, onExpandChange }: DailyPerformanceChartProps) {
    const { trades } = useTrades();

    const calculateDailyPerformance = (trades: Trade[]): DailyPerformanceData[] => {
        // Only consider closed trades
        const closedTrades = trades.filter(trade => trade.sellTime && trade.profit !== null);

        if (closedTrades.length === 0) return [];

        // Get date range from the first trade to today
        const firstTradeDate = new Date(Math.min(...closedTrades.map(t => new Date(t.sellTime!).getTime())));
        const lastTradeDate = new Date(Math.max(...closedTrades.map(t => new Date(t.sellTime!).getTime())));

        // Initialize daily data with all dates in range
        const dailyData = eachDayOfInterval({
            start: startOfDay(firstTradeDate),
            end: startOfDay(lastTradeDate)
        }).reduce((acc, date) => {
            acc[format(date, 'yyyy-MM-dd')] = {
                date: format(date, 'yyyy-MM-dd'),
                profit: 0,
                trades: 0,
            };
            return acc;
        }, {} as Record<string, DailyPerformanceData>);

        // Calculate daily profits and trades
        closedTrades.forEach(trade => {
            if (trade.sellTime && trade.profit !== null) {
                const day = format(new Date(trade.sellTime), 'yyyy-MM-dd');
                dailyData[day].profit += trade.profit;
                dailyData[day].trades += 1;
            }
        });

        // Convert to array and sort by date
        return Object.values(dailyData)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const data = trades.data ? calculateDailyPerformance(trades.data as Trade[]) : [];

    if (trades.isLoading) {
        return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
    }

    const renderChart = (className?: string) => (
        <div className={cn("relative", className)}>
            <ResponsiveContainer width="100%" height="95%">
                <LineChart
                    data={data}
                    margin={{ top: 15, right: 35, left: 35, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        height={35}
                    />
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        width={70}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value} trades`}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        width={70}
                    />
                    <Tooltip
                        formatter={(value: number, name) => {
                            if (name === 'profit') {
                                return [`$${value.toLocaleString()}`, 'Daily P/L'];
                            }
                            return [value, 'Trades'];
                        }}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '6px',
                            padding: '8px',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="profit"
                        stroke="#8884d8"
                        dot={false}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="trades"
                        stroke="#82ca9d"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <>
            {renderChart("h-[300px]")}

            <ChartDialog
                open={isExpanded}
                onOpenChange={onExpandChange}
                title="Daily Performance"
            >
                {renderChart("h-full w-full")}
            </ChartDialog>
        </>
    );
} 