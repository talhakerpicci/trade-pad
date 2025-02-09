"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTrades } from "@/hooks/use-trades";
import { cn } from "@/lib/utils";
import { ChartDialog } from "./chart-dialog";

interface WinRateData {
    name: string;
    value: number;
}

interface WinRateChartProps {
    isExpanded: boolean;
    onExpandChange: (expanded: boolean) => void;
}

export function WinRateChart({ isExpanded, onExpandChange }: WinRateChartProps) {
    const { trades } = useTrades();

    const calculateWinRate = (): WinRateData[] => {
        if (!trades.data) return [];

        const closedTrades = trades.data.filter(trade => trade.sellTime !== null);
        const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);

        const winningCount = winningTrades.length;
        const losingCount = closedTrades.length - winningCount;

        return [
            {
                name: "Winning Trades",
                value: closedTrades.length > 0
                    ? (winningCount / closedTrades.length) * 100
                    : 0
            },
            {
                name: "Losing Trades",
                value: closedTrades.length > 0
                    ? (losingCount / closedTrades.length) * 100
                    : 0
            },
        ];
    };

    const data = calculateWinRate();
    const COLORS = ["#4ade80", "#f87171"];

    const renderChart = (className?: string) => (
        <div className={cn("relative", className)}>
            <ResponsiveContainer width="100%" height="95%">
                <PieChart margin={{
                    top: 0, right: 0, left: 0, bottom: 5
                }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
                    />
                    <Legend
                        formatter={(value, entry) => {
                            const { payload } = entry as any;
                            return `${value} (${payload.value.toFixed(1)}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    if (trades.isLoading) {
        return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
    }

    if (!trades.data?.length) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trades to analyze
            </div>
        );
    }

    return (
        <>
            {renderChart("h-[300px]")}

            <ChartDialog
                open={isExpanded}
                onOpenChange={onExpandChange}
                title="Win Rate"
            >
                {renderChart("h-full w-full")}
            </ChartDialog>
        </>
    );
} 