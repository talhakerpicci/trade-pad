"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradesDataTable } from "@/components/trades/trades-table";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { WinRateChart } from "@/components/charts/win-rate-chart";
import { DailyPerformanceChart } from "@/components/charts/daily-performance-chart";
import { StatsCards } from "@/components/stats/stats-cards";
import { Suspense } from "react";
import { useResetPortfolio } from "@/hooks/use-portfolio";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AddTradeDialog } from "@/components/trades/add-trade-dialog";
import { TopPairsChart } from "@/components/charts/top-pairs-chart";
import { BarChart2, Maximize2 } from "lucide-react";
import { AnalyticsDialog } from "@/components/analytics/analytics-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardPage() {
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
    const [newAmount, setNewAmount] = useState("");
    const resetPortfolio = useResetPortfolio();
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const { user, logout } = useAuth();
    const [isPortfolioExpanded, setIsPortfolioExpanded] = useState(false);
    const [isWinRateExpanded, setIsWinRateExpanded] = useState(false);
    const [isTopPairsExpanded, setIsTopPairsExpanded] = useState(false);
    const [isDailyPerfExpanded, setIsDailyPerfExpanded] = useState(false);

    const handleReset = async () => {
        await resetPortfolio.mutateAsync(Number(newAmount));
        setIsResetOpen(false);
        setNewAmount("");
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto space-y-6">
                {/* Header Section with Profile */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">{user?.email}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="text-red-500 focus:text-red-500 cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Subtitle and Action Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <p className="text-muted-foreground">
                        Track your trading performance
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setIsAnalyticsOpen(true)}>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button variant="outline" onClick={() => setIsResetOpen(true)}>
                            Reset Portfolio
                        </Button>
                        <Link href="/history">
                            <Button variant="outline">
                                View History
                            </Button>
                        </Link>
                        <Button onClick={() => setIsAddTradeOpen(true)}>
                            Add New Trade
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatsCards />

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Total Profit/Loss</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsPortfolioExpanded(true)}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
                                <PortfolioChart
                                    isExpanded={isPortfolioExpanded}
                                    onExpandChange={setIsPortfolioExpanded}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Win Rate</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsWinRateExpanded(true)}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
                                <WinRateChart
                                    isExpanded={isWinRateExpanded}
                                    onExpandChange={setIsWinRateExpanded}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Top Trading Pairs</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsTopPairsExpanded(true)}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-4">
                            <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
                                <TopPairsChart
                                    isExpanded={isTopPairsExpanded}
                                    onExpandChange={setIsTopPairsExpanded}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Daily Performance</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsDailyPerfExpanded(true)}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-4">
                            <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
                                <DailyPerformanceChart
                                    isExpanded={isDailyPerfExpanded}
                                    onExpandChange={setIsDailyPerfExpanded}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>

                {/* Trades Table */}
                <div className="rounded-lg border bg-card">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Recent Trades</h2>
                            <Button onClick={() => setIsAddTradeOpen(true)}>
                                Add New Trade
                            </Button>
                        </div>
                        <TradesDataTable />
                    </div>
                </div>
            </div>

            {/* Reset Portfolio Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Portfolio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            This will archive your current trades and start fresh with a new amount.
                        </p>
                        <div className="space-y-3">
                            <label className="block">New Portfolio Amount</label>
                            <Input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="Enter new amount"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReset}>
                            Reset Portfolio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Trade Dialog */}
            <AddTradeDialog
                open={isAddTradeOpen}
                onOpenChange={setIsAddTradeOpen}
            />

            {/* Analytics Dialog */}
            <AnalyticsDialog
                open={isAnalyticsOpen}
                onOpenChange={setIsAnalyticsOpen}
            />
        </DashboardLayout>
    );
} 