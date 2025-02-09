"use client"

import { useState } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@/types/trade";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { ChartDialog } from "./chart-dialog";
import { cn } from "@/lib/utils";

interface PortfolioDataPoint {
    date: string;
    value: number;
}

interface PortfolioChartProps {
    isExpanded: boolean;
    onExpandChange: (expanded: boolean) => void;
}

export function PortfolioChart({ isExpanded, onExpandChange }: PortfolioChartProps) {
    const { trades, stats } = useTrades();

    const calculatePortfolioData = (trades: Trade[]): PortfolioDataPoint[] => {
        const sortedTrades = [...trades].sort((a, b) =>
            new Date(a.sellTime || a.buyTime).getTime() - new Date(b.sellTime || b.buyTime).getTime()
        );

        const initialValue = stats.data?.initialAmount || 0;
        const dataPoints: PortfolioDataPoint[] = [];

        // Start with initial amount
        if (trades.length > 0) {
            dataPoints.push({
                date: format(new Date(trades[0].sellTime || trades[0].buyTime), 'yyyy-MM-dd'),
                value: initialValue,
            });
        }

        // Calculate running total
        let runningTotal = initialValue;
        sortedTrades.forEach(trade => {
            if (trade.sellTime) {
                runningTotal += (trade.profit || 0);
                dataPoints.push({
                    date: format(new Date(trade.sellTime), 'yyyy-MM-dd'),
                    value: runningTotal,
                });
            }
        });

        return dataPoints;
    };

    const data = trades.data ? calculatePortfolioData(trades.data as Trade[]) : [];

    if (trades.isLoading || stats.isLoading) {
        return <Skeleton className="h-[300px] w-full" />;
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);

    const renderChart = (className?: string) => (
        <div className={cn("relative", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 15, right: 20, left: 50, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Profit"]}
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
                        wrapperStyle={{
                            outline: 'none'
                        }}
                        labelStyle={{
                            color: 'hsl(var(--popover-foreground))',
                            fontWeight: 600,
                            marginBottom: '4px',
                        }}
                    />
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <>
            {renderChart("h-[300px]")}

            <ChartDialog
                open={isExpanded}
                onOpenChange={onExpandChange}
                title="Total Profit/Loss Over Time"
            >
                {renderChart("h-full w-full")}
            </ChartDialog>
        </>
    );
} 