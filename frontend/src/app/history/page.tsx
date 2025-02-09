"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolioHistory } from "@/hooks/use-portfolio";
import { format, startOfDay } from "date-fns";
import { Trade } from "@/types/trade";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HistoryPage() {
    const { data, isLoading, error } = usePortfolioHistory();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-4">Portfolio History</h1>
                <p className="text-red-500">Error loading history: {error.message}</p>
            </div>
        );
    }

    if (!data || !data.history) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-4">Portfolio History</h1>
                <p>No portfolio history available. Try resetting your portfolio to create history entries.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Portfolio History</h1>
                <Link href="/">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {data.history.map((period) => (
                    <Card key={period.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Portfolio Period</span>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(period.startDate), 'MMM d, yyyy')} - {period.endDate ? format(new Date(period.endDate), 'MMM d, yyyy') : 'Current'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Initial Amount</p>
                                    <p className="text-2xl font-bold">${period.initialAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Final Amount</p>
                                    <p className="text-2xl font-bold">${period.finalAmount?.toFixed(2) || 'Active'}</p>
                                </div>
                                {period.finalAmount && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Return</p>
                                        <p className={`text-2xl font-bold ${period.finalAmount > period.initialAmount ? 'text-green-500' : 'text-red-500'}`}>
                                            {(((period.finalAmount - period.initialAmount) / period.initialAmount) * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    Trades During This Period ({period.trades.length})
                                </h3>
                                <HistoricalTradesTable trades={period.trades} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

interface HistoricalTradesTableProps {
    trades: Trade[];
}

function HistoricalTradesTable({ trades }: HistoricalTradesTableProps) {
    return (
        <div className="rounded-md border">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left">Market</th>
                        <th className="p-2 text-right">Buy Price</th>
                        <th className="p-2 text-right">Sell Price</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Profit/Loss</th>
                        <th className="p-2">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {trades && trades.map((trade) => (
                        <tr key={trade.id} className="border-b">
                            <td className="p-2">{trade.market}</td>
                            <td className="p-2 text-right">${trade.buyPrice}</td>
                            <td className="p-2 text-right">${trade.sellPrice || '-'}</td>
                            <td className="p-2 text-right">{trade.quantity}</td>
                            <td className={`p-2 text-right ${trade.profit && trade.profit > 0 ? 'text-green-500' : trade.profit && trade.profit < 0 ? 'text-red-500' : ''}`}>
                                ${trade.profit?.toFixed(2) || '-'}
                            </td>
                            <td className="p-2">
                                {trade.sellTime ? format(new Date(trade.sellTime), 'MMM d, yyyy') : '-'}
                            </td>
                        </tr>
                    ))}
                    {(!trades || trades.length === 0) && (
                        <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                No trades found for this period
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
} 