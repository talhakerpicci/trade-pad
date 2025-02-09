import express from 'express';
import { body } from 'express-validator';
import {
    createTrade,
    getAllTrades,
    updateTrade,
    deleteTrade,
    getTradeStats
} from '../controllers/trade-controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/require-auth';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllTrades);

router.get('/stats', getTradeStats);

router.post(
    '/',
    [
        body('market').notEmpty().withMessage('Market is required'),
        body('buyPrice')
            .isFloat({ gt: 0 })
            .withMessage('Buy price must be greater than 0'),
        body('quantity')
            .isFloat({ gt: 0 })
            .withMessage('Quantity must be greater than 0'),
    ],
    validateRequest,
    createTrade
);

router.patch(
    '/:id',
    [
        body('sellPrice')
            .isFloat({ gt: 0 })
            .withMessage('Sell price must be greater than 0'),
        body('sellTime').isISO8601().withMessage('Invalid sell time'),
    ],
    validateRequest,
    updateTrade
);

router.put('/:id', updateTrade);

router.delete('/:id', deleteTrade);

export { router as tradeRoutes };
