"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistance, format } from "date-fns";
import { useState } from "react";
import { AddTradeDialog } from "./add-trade-dialog";
import { useTrades } from '@/hooks/use-trades';
import { Trade } from '@/types/trade';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { EditTradeDialog } from "./edit-trade-dialog";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TradesDataTable() {
    const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { trades, closeTrade, deleteTrade } = useTrades();
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

    const totalPages = Math.ceil((trades.data?.length || 0) / pageSize);
    const paginatedTrades = trades.data?.slice((page - 1) * pageSize, page * pageSize);

    const handleCloseTrade = async (trade: Trade) => {
        const sellPrice = window.prompt('Enter sell price:');
        if (!sellPrice) return;

        await closeTrade.mutateAsync({
            tradeId: trade.id,
            data: {
                sellPrice: Number(sellPrice),
                sellTime: new Date(),
            },
        });
    };

    const columns = [
        {
            id: "actions",
            cell: ({ row }: { row: { original: Trade } }) => {
                const trade = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setEditingTrade(trade)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this trade?")) {
                                        deleteTrade(trade.id);
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Market</TableHead>
                            <TableHead className="text-right">Buy Price</TableHead>
                            <TableHead className="text-right">Sell Price</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead>Buy Time</TableHead>
                            <TableHead>Trade Duration</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTrades?.map((trade) => (
                            <TableRow
                                key={trade.id}
                                className={clsx(
                                    "transition-colors",
                                    trade.profit && {
                                        'bg-green-100/80 hover:bg-green-200/80 dark:bg-green-900/20 dark:hover:bg-green-900/30': trade.profit > 0,
                                        'bg-red-100/80 hover:bg-red-200/80 dark:bg-red-900/20 dark:hover:bg-red-900/30': trade.profit < 0
                                    }
                                )}
                            >
                                <TableCell>{trade.market}</TableCell>
                                <TableCell className="text-right">${trade.buyPrice}</TableCell>
                                <TableCell className="text-right">
                                    {trade.sellPrice ? `$${trade.sellPrice}` : "-"}
                                </TableCell>
                                <TableCell className="text-right">{trade.quantity}</TableCell>
                                <TableCell className="text-right">
                                    {trade.profit ? `$${trade.profit.toFixed(2)}` : "-"}
                                </TableCell>
                                <TableCell>{format(new Date(trade.buyTime), "dd/MM/yyyy HH:mm")}</TableCell>
                                <TableCell>
                                    {trade.sellTime
                                        ? formatDistance(new Date(trade.sellTime), new Date(trade.buyTime))
                                        : <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCloseTrade(trade as Trade)}
                                        >
                                            Close Trade
                                        </Button>
                                    }
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => setEditingTrade(trade as Trade)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this trade?")) {
                                                        deleteTrade(trade.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Rows per page:
                    </p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue>{pageSize}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <AddTradeDialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen} />
            {editingTrade && (
                <EditTradeDialog
                    trade={editingTrade}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingTrade(null);
                    }}
                />
            )}
        </div>
    );
} 