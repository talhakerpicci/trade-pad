import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

export const getAllTrades = async (req: Request, res: Response) => {
    const trades = await prisma.trade.findMany({
        where: {
            userId: req.user!.id,
            isActive: true
        },
        orderBy: {
            buyTime: 'desc'
        }
    });

    res.json(trades);
};

export const createTrade = async (req: Request, res: Response) => {
    const { market, buyPrice, quantity } = req.body;

    const trade = await prisma.trade.create({
        data: {
            market,
            buyPrice,
            quantity,
            userId: req.user!.id
        }
    });

    res.status(201).json(trade);
};

export const updateTrade = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { market, buyPrice, sellPrice, quantity, sellTime } = req.body;

    const trade = await prisma.trade.findUnique({
        where: { id }
    });

    if (!trade) {
        throw new NotFoundError();
    }

    if (trade.userId !== req.user!.id) {
        throw new BadRequestError('Not authorized');
    }

    // Calculate profit if we have a sell price
    let profit = undefined;
    if (sellPrice !== null && sellPrice !== undefined) {
        profit = (sellPrice - (buyPrice || trade.buyPrice)) * (quantity || trade.quantity);
    }

    const updatedTrade = await prisma.trade.update({
        where: { id },
        data: {
            ...(market && { market }),
            ...(buyPrice && { buyPrice }),
            ...(quantity && { quantity }),
            ...(sellPrice !== undefined && { sellPrice }),
            ...(sellTime !== undefined && { sellTime: sellTime ? new Date(sellTime) : null }),
            ...(profit !== undefined && { profit })
        }
    });

    res.json(updatedTrade);
};

export const deleteTrade = async (req: Request, res: Response) => {
    const { id } = req.params;

    const trade = await prisma.trade.findUnique({
        where: { id }
    });

    if (!trade) {
        throw new NotFoundError();
    }

    if (trade.userId !== req.user!.id) {
        throw new BadRequestError('Not authorized');
    }

    await prisma.trade.delete({
        where: { id }
    });

    res.status(204).send();
};

export const getTradeStats = async (req: Request, res: Response) => {
    const trades = await prisma.trade.findMany({
        where: {
            userId: req.user!.id,
            isActive: true
        },
        orderBy: {
            buyTime: 'asc'
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
    });

    if (!user) {
        throw new NotFoundError();
    }

    // Calculate total profit from closed trades only
    const closedTrades = trades.filter(trade => trade.sellTime !== null);
    const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

    // Calculate win rate from closed trades
    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Calculate current portfolio value
    // Start with initial amount
    let portfolioValue = user.initialAmount;

    // Add profits from closed trades
    portfolioValue += totalProfit;

    // Add current value of open trades
    const openTrades = trades.filter(trade => trade.sellTime === null);
    const openTradesValue = openTrades.reduce((sum, trade) => {
        return sum + (trade.buyPrice * trade.quantity);
    }, 0);

    portfolioValue += openTradesValue;

    // Calculate best performing pair
    const pairStats = closedTrades.reduce((acc, trade) => {
        if (!acc[trade.market]) {
            acc[trade.market] = { profit: 0, trades: 0 };
        }
        acc[trade.market].profit += trade.profit || 0;
        acc[trade.market].trades += 1;
        return acc;
    }, {} as Record<string, { profit: number; trades: number }>);

    const bestPerformingPair = Object.entries(pairStats)
        .map(([market, stats]) => ({
            market,
            return: (stats.profit / user.initialAmount) * 100
        }))
        .sort((a, b) => b.return - a.return)[0] || null;

    res.json({
        totalProfit,
        winRate,
        portfolioValue,
        bestPerformingPair
    });
};
