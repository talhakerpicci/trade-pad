"use client"

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { Trade } from "@/types/trade";
import { format, parseISO, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
    month: string;
    profit: number;
    trades: number;
}

export function MonthlyPerformanceChart() {
    const { trades } = useTrades();

    const calculateMonthlyData = (trades: Trade[]): MonthlyData[] => {
        const monthlyMap = new Map<string, { profit: number; trades: number }>();

        trades.forEach(trade => {
            if (trade.sellTime && trade.profit) {
                const monthKey = format(startOfMonth(parseISO(trade.sellTime)), 'yyyy-MM');
                const current = monthlyMap.get(monthKey) || { profit: 0, trades: 0 };

                monthlyMap.set(monthKey, {
                    profit: current.profit + trade.profit,
                    trades: current.trades + 1,
                });
            }
        });

        return Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                profit: Number(data.profit.toFixed(2)),
                trades: data.trades,
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6); // Show last 6 months
    };

    const data = trades.data ? calculateMonthlyData(trades.data as Trade[]) : [];

    if (trades.isLoading) {
        return <Skeleton className="h-[300px] w-full" />;
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="month"
                        tickFormatter={(date) => format(parseISO(`${date}-01`), 'MMM yyyy')}
                        stroke="var(--muted-foreground)"
                        tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke="var(--muted-foreground)"
                        tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <Tooltip
                        formatter={(value: number, name) => [
                            name === 'profit' ? formatCurrency(value) : value,
                            name === 'profit' ? 'Profit' : 'Number of Trades'
                        ]}
                        labelFormatter={(label) => format(parseISO(`${label}-01`), 'MMMM yyyy')}
                        contentStyle={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '6px',
                            padding: '8px',
                            color: 'var(--foreground)',
                        }}
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