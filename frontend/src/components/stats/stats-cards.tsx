"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, BarChart2, Percent } from "lucide-react";
import { useTrades } from "@/hooks/use-trades";

export function StatsCards() {
    const { stats } = useTrades();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${stats.data?.totalProfit.toFixed(2) || "0.00"}
                    </div>
                </CardContent>
            </Card>

            <Card className="p-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.data?.winRate.toFixed(1) || "0"}%
                    </div>
                </CardContent>
            </Card>

            <Card className="p-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${stats.data?.portfolioValue.toFixed(2) || "0.00"}
                    </div>
                </CardContent>
            </Card>

            <Card className="p-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Best Pair</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.data?.bestPerformingPair?.market || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.data?.bestPerformingPair?.return.toFixed(1)}% return
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 