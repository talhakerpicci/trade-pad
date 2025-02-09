"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTrades } from "@/hooks/use-trades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface AnalyticsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
    const { trades } = useTrades();

    const calculateAnalytics = () => {
        if (!trades.data) return null;

        const closedTrades = trades.data.filter(t => t.sellTime && t.profit !== null);
        const winningTrades = closedTrades.filter(t => t.profit !== null && t.profit > 0);
        const losingTrades = closedTrades.filter(t => t.profit !== null && t.profit < 0);

        const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        const avgWinAmount = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / winningTrades.length;
        const avgLossAmount = losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / losingTrades.length;

        // Calculate best streak
        let currentStreak = 0;
        let bestStreak = 0;
        let worstStreak = 0;
        let currentLossStreak = 0;

        closedTrades
            .sort((a, b) => new Date(a.sellTime!).getTime() - new Date(b.sellTime!).getTime())
            .forEach(trade => {
                if (trade.profit && trade.profit > 0) {
                    currentStreak++;
                    currentLossStreak = 0;
                    bestStreak = Math.max(bestStreak, currentStreak);
                } else {
                    currentLossStreak++;
                    currentStreak = 0;
                    worstStreak = Math.max(worstStreak, currentLossStreak);
                }
            });

        // Calculate average trade duration
        const avgDuration = closedTrades.reduce((sum, trade) => {
            return sum + (new Date(trade.sellTime!).getTime() - new Date(trade.buyTime).getTime());
        }, 0) / closedTrades.length;

        // Most profitable hours
        const hourlyProfits = closedTrades.reduce((acc, trade) => {
            const hour = new Date(trade.sellTime!).getHours();
            acc[hour] = (acc[hour] || 0) + (trade.profit || 0);
            return acc;
        }, {} as Record<number, number>);

        const bestHour = Object.entries(hourlyProfits)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            totalTrades: closedTrades.length,
            winRate: (winningTrades.length / closedTrades.length) * 100,
            totalProfit,
            avgWinAmount,
            avgLossAmount,
            profitFactor: Math.abs(avgWinAmount / avgLossAmount),
            bestStreak,
            worstStreak,
            avgDuration,
            bestHour: bestHour ? {
                hour: parseInt(bestHour[0]),
                profit: bestHour[1]
            } : null,
        };
    };

    const analytics = calculateAnalytics();

    if (!analytics) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[900px] max-h-[600px]">
                <DialogHeader>
                    <DialogTitle>Trading Analytics</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="text-muted-foreground">Win Rate:</span>
                                    <span className="float-right font-medium">
                                        {analytics.winRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Profit Factor:</span>
                                    <span className="float-right font-medium">
                                        {analytics.profitFactor.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Avg Win:</span>
                                    <span className="float-right font-medium text-green-500">
                                        ${analytics.avgWinAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Avg Loss:</span>
                                    <span className="float-right font-medium text-red-500">
                                        ${analytics.avgLossAmount.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Trading Patterns</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="text-muted-foreground">Best Win Streak:</span>
                                    <span className="float-right font-medium">
                                        {analytics.bestStreak} trades
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Worst Loss Streak:</span>
                                    <span className="float-right font-medium">
                                        {analytics.worstStreak} trades
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Avg Trade Duration:</span>
                                    <span className="float-right font-medium">
                                        {Math.round(analytics.avgDuration / (1000 * 60 * 60))} hours
                                    </span>
                                </div>
                                {analytics.bestHour && (
                                    <div>
                                        <span className="text-muted-foreground">Most Profitable Hour:</span>
                                        <span className="float-right font-medium">
                                            {analytics.bestHour.hour}:00 (${analytics.bestHour.profit.toFixed(2)})
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 