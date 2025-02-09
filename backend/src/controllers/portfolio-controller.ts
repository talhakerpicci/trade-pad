import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError } from '../errors/bad-request-error';

export const resetPortfolio = async (req: Request, res: Response) => {
    const { newAmount } = req.body;

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Get current portfolio stats
        const currentStats = await tx.trade.aggregate({
            where: {
                userId: req.user!.id,
                isActive: true,
                sellTime: { not: null }
            },
            _sum: {
                profit: true
            }
        });

        const user = await tx.user.findUnique({
            where: { id: req.user!.id }
        });

        if (!user) {
            throw new BadRequestError('User not found');
        }

        const now = new Date();

        // Create portfolio history entry for the previous period
        const historyEntry = await tx.portfolioHistory.create({
            data: {
                userId: req.user!.id,
                initialAmount: user.initialAmount,
                finalAmount: user.initialAmount + (currentStats._sum.profit || 0),
                startDate: user.createdAt,
                endDate: now
            }
        });

        // Associate current trades with this history entry
        await tx.trade.updateMany({
            where: {
                userId: req.user!.id,
                isActive: true
            },
            data: {
                isActive: false,
                portfolioHistoryId: historyEntry.id
            }
        });

        // Create a new portfolio history entry for the new period
        const newPeriod = await tx.portfolioHistory.create({
            data: {
                userId: req.user!.id,
                initialAmount: newAmount,
                startDate: now
            }
        });

        // Update user's initial amount
        const updatedUser = await tx.user.update({
            where: { id: req.user!.id },
            data: {
                initialAmount: newAmount
            }
        });

        return updatedUser;
    });

    res.json(result);
};

export const getPortfolioHistory = async (req: Request, res: Response) => {
    const history = await prisma.portfolioHistory.findMany({
        where: {
            userId: req.user!.id
        },
        include: {
            trades: {
                orderBy: {
                    buyTime: 'desc'
                }
            }
        },
        orderBy: {
            startDate: 'desc'
        }
    });

    res.json({ history });
};
