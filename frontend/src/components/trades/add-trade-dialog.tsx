"use client"

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTrades } from "@/hooks/use-trades";

const formSchema = z.object({
    market: z.string().min(1, "Market is required"),
    buyPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Buy price must be a positive number",
    }),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Quantity must be a positive number",
    }),
});

interface AddTradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTradeDialog({ open, onOpenChange }: AddTradeDialogProps) {
    const { createTrade } = useTrades();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            market: "",
            buyPrice: "",
            quantity: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createTrade.mutateAsync({
            market: values.market,
            buyPrice: Number(values.buyPrice),
            quantity: Number(values.quantity),
        });
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Trade</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="market"
                                render={({ field }) => (
                                    <FormItem className="space-y-6">
                                        <FormLabel>Market Pair</FormLabel>
                                        <FormControl>
                                            <Input placeholder="BTC/USDT" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="buyPrice"
                                render={({ field }) => (
                                    <FormItem className="space-y-6">
                                        <FormLabel>Buy Price</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="space-y-6">
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Add Trade</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
} 