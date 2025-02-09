"use client"

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trade } from "@/types/trade";
import { useTrades } from "@/hooks/use-trades";

interface EditTradeDialogProps {
    trade: Trade;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTradeDialog({ trade, open, onOpenChange }: EditTradeDialogProps) {
    const { updateTrade } = useTrades();
    const [market, setMarket] = useState(trade.market);
    const [buyPrice, setBuyPrice] = useState(trade.buyPrice.toString());
    const [sellPrice, setSellPrice] = useState(trade.sellPrice?.toString() || "");
    const [quantity, setQuantity] = useState(trade.quantity.toString());
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await updateTrade({
                id: trade.id,
                market,
                buyPrice: Number(buyPrice),
                sellPrice: sellPrice ? Number(sellPrice) : null,
                quantity: Number(quantity),
                sellTime: trade.sellTime
            });
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to update trade");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Trade</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="market">Market</Label>
                        <Input
                            id="market"
                            value={market}
                            onChange={(e) => setMarket(e.target.value)}
                            placeholder="e.g., BTC/USDT"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buyPrice">Buy Price</Label>
                        <Input
                            id="buyPrice"
                            type="number"
                            step="any"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sellPrice">Sell Price (optional)</Label>
                        <Input
                            id="sellPrice"
                            type="number"
                            step="any"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="any"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
